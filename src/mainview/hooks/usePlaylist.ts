import { Effect } from "effect"
import { useCallback, useState } from "react"
import { PlaylistService, PlaylistServiceLive } from "../services/PlaylistService"
import type { Channel } from "../types/channel"

export function usePlaylist() {
	const [channels, setChannels] = useState<Channel[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const load = useCallback(async (url: string): Promise<number | null> => {
		setLoading(true)
		setError(null)

		try {
			const result = await Effect.runPromise(
				Effect.flatMap(PlaylistService, (s) => s.fetchPlaylist(url)).pipe(
					Effect.provide(PlaylistServiceLive),
				),
			)
			setChannels(result)
			return result.length
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load playlist")
			return null
		} finally {
			setLoading(false)
		}
	}, [])

	return { channels, loading, error, load }
}

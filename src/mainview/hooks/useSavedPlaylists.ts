import { useCallback, useEffect, useState } from "react"
import { rpc } from "../rpc"

export interface SavedPlaylist {
	id: string
	name: string
	url: string
	channelCount: number
}

export function useSavedPlaylists() {
	const [playlists, setPlaylists] = useState<SavedPlaylist[]>([])

	useEffect(() => {
		rpc.request.getPlaylists().then((rows) => {
			setPlaylists(
				rows.map((r) => ({
					id: r.id,
					name: r.name,
					url: r.url,
					channelCount: r.channel_count,
				})),
			)
		})
	}, [])

	const add = useCallback(
		async (url: string, name: string): Promise<SavedPlaylist | undefined> => {
			if (!url.trim()) return
			const item: SavedPlaylist = {
				id: crypto.randomUUID(),
				name: name.trim() || url,
				url: url.trim(),
				channelCount: 0,
			}
			await rpc.request.addPlaylist({ id: item.id, name: item.name, url: item.url })
			setPlaylists((prev) => [...prev, item])
			return item
		},
		[],
	)

	const remove = useCallback(async (id: string) => {
		await rpc.request.removePlaylist({ id })
		setPlaylists((prev) => prev.filter((p) => p.id !== id))
	}, [])

	const updateCount = useCallback(async (id: string, channelCount: number) => {
		await rpc.request.updateChannelCount({ id, channelCount })
		setPlaylists((prev) =>
			prev.map((p) => (p.id === id ? { ...p, channelCount } : p)),
		)
	}, [])

	const rename = useCallback(async (id: string, name: string) => {
		await rpc.request.renamePlaylist({ id, name })
		setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
	}, [])

	return { playlists, add, remove, updateCount, rename }
}

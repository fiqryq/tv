import { Context, Data, Effect, Layer, Schedule } from "effect"
import type { Channel } from "../types/channel"

export class FetchError extends Data.TaggedError("FetchError")<{
	cause: unknown
}> {}

export class ParseError extends Data.TaggedError("ParseError")<{
	cause: unknown
}> {}

const parseM3U = (content: string): Channel[] => {
	const lines = content.split("\n").map((l) => l.trim()).filter(Boolean)
	const channels: Channel[] = []

	for (let i = 0; i < lines.length; i++) {
		if (!lines[i].startsWith("#EXTINF:")) continue

		const info = lines[i]
		const url = lines[i + 1]
		if (!url || url.startsWith("#")) continue

		const name = info.match(/,(.+)$/)?.[1].trim() ?? "Unknown"
		const logo = info.match(/tvg-logo="([^"]*)"/)?.[1]
		const group = info.match(/group-title="([^"]*)"/)?.[1]
		const tvgId = info.match(/tvg-id="([^"]*)"/)?.[1]

		channels.push({
			id: tvgId || `ch-${channels.length}`,
			name,
			url,
			logo: logo || undefined,
			group: group || undefined,
		})

		i++
	}

	return channels
}

export interface PlaylistService {
	readonly fetchPlaylist: (
		url: string,
	) => Effect.Effect<Channel[], FetchError | ParseError>
}

export const PlaylistService =
	Context.GenericTag<PlaylistService>("PlaylistService")

export const PlaylistServiceLive = Layer.succeed(
	PlaylistService,
	PlaylistService.of({
		fetchPlaylist: (url: string) =>
			Effect.tryPromise({
				try: () =>
					fetch(url).then((r) => {
						if (!r.ok) throw new Error(`HTTP ${r.status}`)
						return r.text()
					}),
				catch: (cause) => new FetchError({ cause }),
			}).pipe(
				Effect.flatMap((content) =>
					Effect.try({
						try: () => parseM3U(content),
						catch: (cause) => new ParseError({ cause }),
					}),
				),
				Effect.retry(Schedule.recurs(2)),
			),
	}),
)

import type { RPCSchema } from "electrobun/view"

export interface PlaylistRow {
	id: string
	name: string
	url: string
	channel_count: number
}

export type BunSchema = RPCSchema<{
	requests: {
		getPlaylists: { params: void; response: PlaylistRow[] }
		addPlaylist: {
			params: { id: string; name: string; url: string }
			response: void
		}
		removePlaylist: { params: { id: string }; response: void }
		updateChannelCount: {
			params: { id: string; channelCount: number }
			response: void
		}
		renamePlaylist: { params: { id: string; name: string }; response: void }
	}
}>

export type WebviewSchema = RPCSchema

export type AppRPCSchema = {
	bun: BunSchema
	webview: WebviewSchema
}

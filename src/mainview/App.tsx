import { useState } from "react"
import { Player } from "./components/Player"
import { PlaylistGrid } from "./components/PlaylistGrid"
import { Sidebar } from "./components/Sidebar"
import { useSavedPlaylists } from "./hooks/useSavedPlaylists"
import { usePlaylist } from "./hooks/usePlaylist"
import type { Channel } from "./types/channel"

function App() {
	const { channels, loading, error, load } = usePlaylist()
	const { playlists, add, remove, updateCount, rename } = useSavedPlaylists()
	const [selected, setSelected] = useState<Channel | null>(null)
	const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

	const handleLoad = (url: string, id: string) => {
		setActivePlaylistId(id)
		setSelected(null)
		load(url).then((count) => {
			if (count) updateCount(id, count)
		})
	}

	const handleBack = () => {
		setActivePlaylistId(null)
		setSelected(null)
		setSidebarCollapsed(false)
	}

	const showPlayer = activePlaylistId !== null

	return (
		<div className="flex w-full h-full bg-black overflow-hidden">
			<main className="flex-1 h-full min-w-0 relative">
				{showPlayer ? (
					<Player
						url={selected?.url ?? null}
						channelName={selected?.name ?? null}
						sidebarCollapsed={sidebarCollapsed}
						onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
					/>
				) : (
					<PlaylistGrid
						playlists={playlists}
						loading={loading}
						error={error}
						activeId={activePlaylistId}
						onLoad={handleLoad}
						onAdd={add}
						onRemove={remove}
						onRename={rename}
					/>
				)}
			</main>

			{showPlayer && !sidebarCollapsed && (
				<Sidebar
					channels={channels}
					selectedId={selected?.id ?? null}
					onSelect={setSelected}
					onBack={handleBack}
					onCollapse={() => setSidebarCollapsed(true)}
				/>
			)}
		</div>
	)
}

export default App

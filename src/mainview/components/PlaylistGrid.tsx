import { useEffect, useRef, useState } from "react"
import type { SavedPlaylist } from "../hooks/useSavedPlaylists"

interface PlaylistGridProps {
	playlists: SavedPlaylist[]
	loading: boolean
	error: string | null
	activeId: string | null
	onLoad: (url: string, id: string) => void
	onAdd: (url: string, name: string) => Promise<SavedPlaylist | undefined>
	onRemove: (id: string) => void
	onRename: (id: string, name: string) => void
}

interface ModalProps {
	onConfirm: (url: string, name: string) => void
	onClose: () => void
}

function AddModal({ onConfirm, onClose }: ModalProps) {
	const [url, setUrl] = useState("")
	const [name, setName] = useState("")
	const urlRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		urlRef.current?.focus()
	}, [])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!url.trim()) return
		onConfirm(url.trim(), name.trim())
	}

	return (
		<div
			className="absolute inset-0 flex items-center justify-center z-50"
			style={{ background: "rgba(0,0,0,0.75)" }}
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="bg-neutral-900 rounded-xl p-6 w-96 shadow-2xl">
				<h2 className="text-white text-sm font-medium mb-5">Add playlist</h2>

				<form onSubmit={handleSubmit} className="space-y-3">
					<div>
						<label className="text-neutral-500 text-xs block mb-1.5">
							Name
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="My Playlist"
							className="w-full bg-neutral-800 text-neutral-200 text-sm px-3 py-2.5 rounded-lg placeholder-neutral-600"
						/>
					</div>
					<div>
						<label className="text-neutral-500 text-xs block mb-1.5">
							M3U URL
						</label>
						<input
							ref={urlRef}
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com/playlist.m3u"
							className="w-full bg-neutral-800 text-neutral-200 text-sm px-3 py-2.5 rounded-lg placeholder-neutral-600"
						/>
					</div>

					<div className="flex gap-2 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!url.trim()}
							className="flex-1 py-2.5 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-30 text-black text-sm font-medium transition-colors"
						>
							Add & Load
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export function PlaylistGrid({
	playlists,
	loading,
	error,
	activeId,
	onLoad,
	onAdd,
	onRemove,
	onRename,
}: PlaylistGridProps) {
	const [showModal, setShowModal] = useState(false)
	const [renamingId, setRenamingId] = useState<string | null>(null)
	const [renameValue, setRenameValue] = useState("")
	const renameRef = useRef<HTMLInputElement>(null)

	const handleAdd = async (url: string, name: string) => {
		const item = await onAdd(url, name)
		if (item) onLoad(item.url, item.id)
		setShowModal(false)
	}

	const startRename = (e: React.MouseEvent, p: SavedPlaylist) => {
		e.stopPropagation()
		setRenamingId(p.id)
		setRenameValue(p.name)
		setTimeout(() => {
			renameRef.current?.select()
		}, 0)
	}

	const commitRename = () => {
		if (renamingId && renameValue.trim()) {
			onRename(renamingId, renameValue.trim())
		}
		setRenamingId(null)
	}

	return (
		<div className="relative w-full h-full bg-black flex flex-col overflow-hidden">
			{/* Header */}
			<div className="px-8 pt-8 pb-6 flex items-center justify-end shrink-0">
				<button
					onClick={() => setShowModal(true)}
					className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs rounded-lg transition-colors"
				>
					<span className="text-base leading-none">+</span>
					<span>Add playlist</span>
				</button>
			</div>

			{/* Grid */}
			<div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
				{playlists.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center gap-4">
						<p className="text-neutral-700 text-sm">No playlists yet</p>
						<button
							onClick={() => setShowModal(true)}
							className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-sm rounded-lg transition-colors"
						>
							+ Add your first playlist
						</button>
					</div>
				) : (
					<div className="grid grid-cols-3 gap-4">
						{playlists.map((p) => {
							const active = activeId === p.id
							const isRenaming = renamingId === p.id
							return (
								<div key={p.id} className="group relative">
									<button
										onClick={() => !isRenaming && onLoad(p.url, p.id)}
										className={`w-full text-left p-5 rounded-xl transition-colors ${
											active
												? "bg-neutral-800 ring-1 ring-neutral-600"
												: "bg-neutral-950 hover:bg-neutral-900"
										}`}
									>
										<div
											className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-lg ${
												active ? "bg-neutral-700" : "bg-neutral-800"
											}`}
										>
											▶
										</div>

										{isRenaming ? (
											<input
												ref={renameRef}
												autoFocus
												value={renameValue}
												onChange={(e) => setRenameValue(e.target.value)}
												onBlur={commitRename}
												onKeyDown={(e) => {
													if (e.key === "Enter") commitRename()
													if (e.key === "Escape") setRenamingId(null)
												}}
												onClick={(e) => e.stopPropagation()}
												className="w-full bg-neutral-700 text-white text-sm font-medium px-2 py-0.5 rounded mb-1 focus:outline-none"
											/>
										) : (
											<p
												className="text-white text-sm font-medium truncate mb-1"
												onDoubleClick={(e) => startRename(e, p)}
											>
												{p.name || "Untitled"}
											</p>
										)}

										<p className="text-neutral-600 text-xs">
											{p.channelCount > 0
												? `${p.channelCount} channels`
												: "Not loaded yet"}
										</p>
										{loading && active && (
											<p className="text-neutral-500 text-xs mt-1">
												Loading…
											</p>
										)}
									</button>

									{!isRenaming && (
										<div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
											<button
												onClick={(e) => startRename(e, p)}
												className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-300 rounded text-xs"
												title="Rename"
											>
												✎
											</button>
											<button
												onClick={() => onRemove(p.id)}
												className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-300 rounded"
												title="Remove"
											>
												×
											</button>
										</div>
									)}
								</div>
							)
						})}
					</div>
				)}

				{error && (
					<p className="mt-4 text-red-400 text-xs">{error}</p>
				)}
			</div>

			{showModal && (
				<AddModal
					onConfirm={handleAdd}
					onClose={() => setShowModal(false)}
				/>
			)}
		</div>
	)
}

import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef, useState } from "react"
import type { Channel } from "../types/channel"

interface SidebarProps {
	channels: Channel[]
	selectedId: string | null
	onSelect: (channel: Channel) => void
	onBack: () => void
	onCollapse: () => void
}

type ListItem =
	| { type: "header"; group: string; count: number }
	| { type: "channel"; channel: Channel }

function buildItems(channels: Channel[], search: string): ListItem[] {
	const q = search.toLowerCase()

	if (q) {
		return channels
			.filter((ch) => ch.name.toLowerCase().includes(q))
			.map((channel) => ({ type: "channel" as const, channel }))
	}

	const groups = new Map<string, Channel[]>()
	for (const ch of channels) {
		const g = ch.group ?? "Other"
		const arr = groups.get(g)
		if (arr) arr.push(ch)
		else groups.set(g, [ch])
	}

	const items: ListItem[] = []
	for (const [group, chs] of groups) {
		items.push({ type: "header", group, count: chs.length })
		for (const ch of chs) items.push({ type: "channel", channel: ch })
	}
	return items
}

export function Sidebar({ channels, selectedId, onSelect, onBack, onCollapse }: SidebarProps) {
	const [search, setSearch] = useState("")
	const scrollRef = useRef<HTMLDivElement>(null)

	const items = buildItems(channels, search)

	const virtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: (i) => (items[i]?.type === "header" ? 28 : 40),
		overscan: 8,
	})

	return (
		<aside className="w-64 h-full bg-neutral-950 flex flex-col shrink-0">
			{/* Header */}
			<div
				className="px-4 flex items-center gap-3 shrink-0"
				style={{
					paddingTop: "16px",
					paddingBottom: "12px",
					WebkitAppRegion: "drag",
				} as React.CSSProperties}
			>
				<button
					onClick={onBack}
					style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
					className="text-neutral-600 hover:text-neutral-300 transition-colors text-sm"
					title="Back to playlists"
				>
					←
				</button>
				<span className="text-neutral-500 text-[10px] font-semibold tracking-[0.15em] uppercase flex-1">
					Channels
				</span>
				<button
					onClick={onCollapse}
					style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
					className="text-neutral-700 hover:text-neutral-400 transition-colors text-sm"
					title="Hide sidebar"
				>
					›
				</button>
			</div>

			{/* Search */}
			<div className="px-4 pb-3 shrink-0">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search…"
					className="w-full bg-neutral-900 text-neutral-300 text-xs px-3 py-2 rounded placeholder-neutral-600 focus:bg-neutral-800 transition-colors"
				/>
			</div>

			{/* Virtualised list with category headers */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
				<div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
					{virtualizer.getVirtualItems().map((vItem) => {
						const item = items[vItem.index]

						if (item.type === "header") {
							return (
								<div
									key={`h-${item.group}`}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: vItem.size,
										transform: `translateY(${vItem.start}px)`,
									}}
									className="px-4 flex items-end pb-1"
								>
									<span className="text-neutral-600 text-[9px] font-semibold tracking-[0.12em] uppercase truncate">
										{item.group}
										<span className="ml-1.5 text-neutral-700 font-normal normal-case tracking-normal">
											{item.count}
										</span>
									</span>
								</div>
							)
						}

						const { channel } = item
						const active = selectedId === channel.id
						return (
							<button
								key={channel.id}
								onClick={() => onSelect(channel)}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: vItem.size,
									transform: `translateY(${vItem.start}px)`,
								}}
								className={`text-left px-4 flex items-center gap-3 transition-colors ${
									active
										? "bg-neutral-800 text-white"
										: "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
								}`}
							>
								{channel.logo ? (
									<img
										src={channel.logo}
										alt=""
										className="w-5 h-5 object-contain rounded shrink-0 opacity-80"
										onError={(e) => {
											e.currentTarget.style.display = "none"
										}}
									/>
								) : (
									<div className="w-5 h-5 rounded bg-neutral-800 shrink-0" />
								)}
								<span className="text-xs truncate flex-1">{channel.name}</span>
								{active && (
									<span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 opacity-70" />
								)}
							</button>
						)
					})}
				</div>
			</div>

			{/* Count */}
			<div className="px-4 py-3 shrink-0">
				<p className="text-neutral-700 text-xs">
					{channels.length} channel{channels.length !== 1 ? "s" : ""}
				</p>
			</div>
		</aside>
	)
}

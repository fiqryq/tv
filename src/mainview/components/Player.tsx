import Hls from "hls.js"
import { useEffect, useRef, useState } from "react"

interface PlayerProps {
	url: string | null
	channelName: string | null
	sidebarCollapsed: boolean
	onToggleSidebar: () => void
}

export function Player({ url, channelName, sidebarCollapsed, onToggleSidebar }: PlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const hlsRef = useRef<Hls | null>(null)
	const [streamError, setStreamError] = useState<string | null>(null)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		setStreamError(null)

		if (hlsRef.current) {
			hlsRef.current.destroy()
			hlsRef.current = null
		}

		if (!url) {
			video.src = ""
			return
		}

		const isHls =
			url.includes(".m3u8") ||
			url.includes("m3u8") ||
			url.includes("/hls/") ||
			url.includes("hls.")

		if (isHls && Hls.isSupported()) {
			const hls = new Hls({ enableWorker: true })
			hlsRef.current = hls
			hls.loadSource(url)
			hls.attachMedia(video)
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				video.play().catch(() => {})
			})
			hls.on(Hls.Events.ERROR, (_e, data) => {
				if (data.fatal) {
					setStreamError("Stream unavailable")
					hls.destroy()
				}
			})
		} else if (
			isHls &&
			video.canPlayType("application/vnd.apple.mpegurl")
		) {
			video.src = url
			video.play().catch(() => {})
		} else {
			video.src = url
			video.play().catch(() => {})
		}

		return () => {
			if (hlsRef.current) {
				hlsRef.current.destroy()
				hlsRef.current = null
			}
		}
	}, [url])

	return (
		<div className="relative w-full h-full bg-black flex items-center justify-center">
			{!url && (
				<p className="text-neutral-600 text-sm select-none">
					Select a channel
				</p>
			)}

			{streamError && (
				<div className="absolute inset-0 flex items-center justify-center">
					<p className="text-neutral-500 text-sm">{streamError}</p>
				</div>
			)}

			<video
				ref={videoRef}
				className="w-full h-full object-contain"
				controls
				playsInline
				style={{ display: url ? "block" : "none" }}
			/>

			{channelName && (
				<div className="absolute bottom-16 left-4 px-2 py-1 bg-black/60 rounded text-white text-xs font-medium pointer-events-none">
					{channelName}
				</div>
			)}

			{/* Sidebar toggle — top-right corner */}
			<button
				onClick={onToggleSidebar}
				className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 hover:bg-black/70 text-neutral-400 hover:text-white transition-all"
				title={sidebarCollapsed ? "Show channels" : "Hide channels"}
			>
				{sidebarCollapsed ? "›" : "‹"}
			</button>
		</div>
	)
}

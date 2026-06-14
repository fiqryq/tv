# TV — IPTV Desktop App

A minimal IPTV streaming desktop app built with [Electrobun](https://electrobun.dev), React, Tailwind CSS, and [Effect](https://effect.website).

<img width="1392" height="872" alt="CleanShot 2026-06-14 at 09 09 26" src="https://github.com/user-attachments/assets/eaf0db22-d199-4363-9af7-bd597537b90f" />

## Features

- Add and manage M3U playlists (persisted in SQLite)
- Browse channels grouped by category
- HLS & native stream playback
- Rename playlists inline (double-click the name)
- Collapsible channel sidebar while watching

## Development

```bash
# Install dependencies
bun install

# Start dev (Vite builds assets, Electrobun runs the app)
bun run dev

# Start with HMR (Vite dev server + Electrobun in watch mode)
bun run dev:hmr
```

## Build

```bash
# Build a canary release for the current platform
bun run build:canary
```

Output: `build/canary-macos-arm64/tv-canary.app` (macOS arm64)

## Opening an Unsigned Build

macOS blocks apps that aren't signed by an Apple-registered developer. To open a local build:

**Remove quarantine (one-time, per build)**

```bash
xattr -cr build/canary-macos-arm64/tv-canary.app
open build/canary-macos-arm64/tv-canary.app
```

**Or via Finder**

1. Navigate to `build/canary-macos-arm64/`
2. Right-click `tv-canary.app` → **Open**
3. Click **Open** in the security dialog

> You only need to do this once per build. After that, double-clicking works.

## GitHub Releases

The `.github/workflows/release.yml` workflow automatically builds and uploads release artifacts when you publish a GitHub release.

**What gets built:**
- `tv-canary-macos-arm64.dmg` — macOS Apple Silicon
- `tv-canary-macos-x64.dmg` — macOS Intel
- `tv-canary-windows-x64.exe` — Windows

**To create a release:**

1. Push your changes
2. Go to **GitHub → Releases → Draft a new release**
3. Set a tag (e.g. `v1.0.0`) and publish
4. GitHub Actions builds all platforms and uploads `.dmg`/`.exe` to the release automatically

**Optional: code signing**

Add these secrets in **Settings → Secrets → Actions** to sign the builds:

| Secret | Description |
|---|---|
| `APPLE_CERTIFICATE` | Base64-encoded `.p12` export |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the `.p12` |
| `APPLE_TEAM_ID` | 10-character Team ID |
| `APPLE_SIGNING_IDENTITY` | `Developer ID Application: Name (TEAMID)` |
| `APPLE_ID` | Apple ID email (for notarization) |
| `APPLE_APP_PASSWORD` | App-specific password (for notarization) |
| `WIN_CERTIFICATE` | Base64-encoded `.pfx` |
| `WIN_CERTIFICATE_PASSWORD` | Password for the `.pfx` |

Without these secrets the build runs unsigned — fine for personal use and testing.

## Project Structure

```
src/
├── bun/
│   ├── index.ts              # Main process: window, menu, RPC handlers
│   └── db.ts                 # SQLite database (bun:sqlite)
├── mainview/
│   ├── App.tsx               # Root component
│   ├── main.tsx              # React entry point
│   ├── rpc.ts                # Electrobun RPC bridge (renderer side)
│   ├── components/
│   │   ├── Player.tsx        # HLS video player
│   │   ├── Sidebar.tsx       # Channel list with categories
│   │   └── PlaylistGrid.tsx  # Playlist management grid
│   ├── hooks/
│   │   ├── usePlaylist.ts        # M3U fetch & parse
│   │   └── useSavedPlaylists.ts  # RPC-backed playlist state
│   └── services/
│       └── PlaylistService.ts    # Effect-based M3U parser
└── shared/
    └── rpcSchema.ts          # Shared RPC type definitions
electrobun.config.ts          # App name, identifier, icons, copy rules
vite.config.ts                # Vite build config
```

## Tech Stack

| Layer | Library |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Desktop framework | [Electrobun](https://electrobun.dev) |
| UI | React 18 + Tailwind CSS |
| Async/effects | [Effect](https://effect.website) |
| Video | hls.js + native WKWebView HLS |
| Virtualization | @tanstack/react-virtual |
| Database | bun:sqlite (SQLite) |

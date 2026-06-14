import { Database } from "bun:sqlite"
import { join } from "path"
import { mkdirSync } from "fs"

const dataDir = join(
	process.env.HOME ?? "~",
	"Library",
	"Application Support",
	"tv",
)

mkdirSync(dataDir, { recursive: true })

const db = new Database(join(dataDir, "playlists.db"), { create: true })

db.run(`
	CREATE TABLE IF NOT EXISTS playlists (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		url TEXT NOT NULL,
		channel_count INTEGER NOT NULL DEFAULT 0,
		created_at INTEGER NOT NULL DEFAULT (unixepoch())
	)
`)

export const queries = {
	getAll: db.query<
		{ id: string; name: string; url: string; channel_count: number },
		[]
	>("SELECT id, name, url, channel_count FROM playlists ORDER BY created_at ASC"),

	insert: db.query<void, [string, string, string]>(
		"INSERT INTO playlists (id, name, url) VALUES (?, ?, ?)",
	),

	delete: db.query<void, [string]>(
		"DELETE FROM playlists WHERE id = ?",
	),

	updateCount: db.query<void, [number, string]>(
		"UPDATE playlists SET channel_count = ? WHERE id = ?",
	),

	updateName: db.query<void, [string, string]>(
		"UPDATE playlists SET name = ? WHERE id = ?",
	),
}

import { createRPC, Electroview } from "electrobun/view"
import type { WebviewSchema, BunSchema } from "../shared/rpcSchema"

// local = webview (handles nothing from bun), remote = bun (we call into)
const rpc = createRPC<WebviewSchema, BunSchema>()

new Electroview({ rpc })

export { rpc }

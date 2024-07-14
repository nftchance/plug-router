import cors from "cors"
import express from "express"
import http from "http"

import { createExpressMiddleware } from "@trpc/server/adapters/express"

import { Router, router } from "@/src/api"
import { env } from "@/src/lib/utils/env"
import { limiter } from "@/src/server/limiter"
import { createContext } from "@/src/server/trpc"

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(limiter)
app.use(
	"/",
	createExpressMiddleware<Router>({
		router,
		createContext
	})
)

server.listen(env.PORT, () => {
	console.log(`   ◍ Plug Router (Express) ${env.VERSION}
   - HTTP: ${env.API_URL}
   - Environments: .env
`)
})
server.on("error", console.error)

process.on("SIGTERM", () => server.close())

export * from "@/src/server/trpc"

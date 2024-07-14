import cors from "cors"
import express from "express"
import { rateLimit } from "express-rate-limit"
import http from "http"

import { createExpressMiddleware } from "@trpc/server/adapters/express"

import { Router, router } from "@/src/api"
import { env } from "@/src/lib/utils/env"
import { createContext } from "@/src/server/trpc"

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(
	rateLimit({
		standardHeaders: true,
		legacyHeaders: false,
		windowMs: env.RATE_LIMIT_WINDOW_MS,
		limit: env.RATE_LIMIT,
		skip: req =>
			req.ip ? env.RATE_LIMIT_ALLOW_LIST.includes(req.ip) : false,
		message: env.RATE_LIMIT_MESSAGE
	})
)
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

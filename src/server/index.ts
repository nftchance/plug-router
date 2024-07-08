import cors from "cors"
import express from "express"
import http from "http"
import ws from "ws"

import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { applyWSSHandler } from "@trpc/server/adapters/ws"

import { Router, router } from "@/src/api"
import { env } from "@/src/lib/utils/env"

import { createContext } from "./trpc"

const app = express()
const server = http.createServer(app)

const wss = new ws.Server({ server })
const wsHandler = applyWSSHandler({ wss, router, createContext })

app.use(cors())
app.use(
	"/trpc",
	createExpressMiddleware<Router>({
		router,
		createContext
	})
)

server.listen(env.PORT, () => {
	console.log(`   ◍ Plug Router (Express) ${env.VERSION}
   - HTTP: ${env.API_URL}
   - Websockets: ${
		env.API_URL.replace("http", "ws") || `ws://localhost:${env.PORT}/trpc`
   }
   - Max Request Size: ${env.MAX_REQUEST_SIZE}
   - Environments: .env
`)
})
server.on("error", console.error)

process.on("SIGTERM", () => {
	wsHandler.broadcastReconnectNotification()
	wss.close()
	server.close()
})

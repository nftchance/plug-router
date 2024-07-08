import superjson from "superjson"

import {
	createTRPCProxyClient,
	httpBatchLink,
	splitLink,
	wsLink
} from "@trpc/client"
import { createWSClient } from "@trpc/client"

import { Router } from "@/src/api"
import { env } from "@/src/lib/utils/env"

export const client = createTRPCProxyClient<Router>({
	transformer: superjson,
	links: [
		splitLink({
			condition: op => op.type === "subscription",
			true: wsLink({
				client: createWSClient({
					url:
						env.API_URL.replace("http", "ws") ||
						`ws://localhost:${env.PORT}/trpc`
				})
			}),
			false: httpBatchLink({
				url: env.API_URL
			})
		})
	]
})

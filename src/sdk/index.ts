import superjson from "superjson"

import {
	createTRPCClient,
	httpBatchLink,
	loggerLink,
	splitLink,
	unstable_httpSubscriptionLink
} from "@trpc/client"

import { Router, env } from "@/src"

const linkOptions = (
	type: "http" | "subscription",
	apiKey: string | undefined
) => {
	const options = {
		transformer: superjson,
		[type === "subscription" ? "connectionParams" : "headers"]:
			async () => ({
				["x-api-key"]: apiKey
			}),
		url: env.API_URL
	} as const

	return type === "subscription"
		? unstable_httpSubscriptionLink(options)
		: httpBatchLink(options)
}

export const createPlugSDK = (
	apiKey: Parameters<typeof linkOptions>[1],
	log: boolean = false
) =>
	createTRPCClient<Router>({
		links: [
			loggerLink({
				enabled: () => log
			}),
			splitLink({
				condition: op => op.type === "subscription",
				true: linkOptions("subscription", apiKey),
				false: linkOptions("http", apiKey)
			})
		]
	})

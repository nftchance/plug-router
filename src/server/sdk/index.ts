import superjson from "superjson"

import {
	createTRPCClient,
	httpBatchLink,
	loggerLink,
	splitLink,
	unstable_httpSubscriptionLink
} from "@trpc/client"

import { Router, env } from "@/src"

const linkOptions = (opt: {
	type: "http" | "subscription"
	apiKey: string | undefined
}) => {
	const { type, apiKey } = opt

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
	apiKey: Parameters<typeof linkOptions>[0]["apiKey"],
	log: boolean = false
) =>
	createTRPCClient<Router>({
		links: [
			loggerLink({
				enabled: () => log
			}),
			splitLink({
				condition: op => op.type === "subscription",
				true: linkOptions({ type: "subscription", apiKey }),
				false: linkOptions({ type: "http", apiKey })
			})
		]
	})

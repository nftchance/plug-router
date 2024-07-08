import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import { client } from "@/src/api/client"
import { intent } from "@/src/api/intent"
import { root } from "@/src/api/root"
import { simulate } from "@/src/api/simulate"
import { createTRPCRouter } from "@/src/server/trpc"

export const router = createTRPCRouter({
	root,
	client,
	intent,
	simulate
})

export type Router = typeof router
export type RouterInputs = inferRouterInputs<Router>
export type RouterOutputs = inferRouterOutputs<Router>

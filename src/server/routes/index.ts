import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import { mergeRouters } from "@/src/server"
import { routerRouter } from "@/src/server/routes/router"
import { solverRouter } from "@/src/server/routes/solver"

export const router = mergeRouters(routerRouter, solverRouter)

export type Router = typeof router
export type RouterInputs = inferRouterInputs<Router>
export type RouterOutputs = inferRouterOutputs<Router>

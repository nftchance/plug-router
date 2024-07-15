import { createTRPCRouter } from "@/src/server"
import client from "@/src/server/routes/router/client"
import root from "@/src/server/routes/router/root"

export const routerRouter = createTRPCRouter({
	root,
	client
})

import { createTRPCRouter, publicProcedure } from "@/src/server/trpc"

export const root = createTRPCRouter({
	health: publicProcedure.query(() => ({
		status: "OK"
	}))
})

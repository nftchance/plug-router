import { createTRPCRouter, publicProcedure } from "@/src/server/trpc"

export default createTRPCRouter({
	health: publicProcedure.query(({ ctx }) => ({
		status: "OK",
		apiKey: ctx.apiKey
	}))
})

import { createTRPCRouter, publicProcedure } from "@/src/server"

export default createTRPCRouter({
	health: publicProcedure.query(({ ctx }) => ({
		status: "OK",
		apiKey: ctx.apiKey
	}))
})

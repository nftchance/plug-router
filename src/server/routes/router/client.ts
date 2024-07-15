import { Client } from "@/src/core"
import { ClientRequestSchema, ClientResponseSchema } from "@/src/lib"
import { createTRPCRouter, publicProcedure } from "@/src/server"

const client = new Client()

export default createTRPCRouter({
	// Initialize a new client at a specific address with an API key
	// or generate a new API key for an existing client.
	init: publicProcedure
		.input(ClientRequestSchema)
		.output(ClientResponseSchema)
		.mutation(async ({ input, ctx }) => await client.init(ctx.db, input))
})

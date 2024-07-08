import { Client } from "@/src/core"
import {
	ClientRequestSchema,
	ClientResponseSchema
} from "@/src/lib/types/client"
import { createTRPCRouter, publicProcedure } from "@/src/server/trpc"

const manager = new Client()

export const client = createTRPCRouter({
	// Initialize a new client at a specific address with an API key
	// or generate a new API key for an existing client.
	init: publicProcedure
		.input(ClientRequestSchema)
		.output(ClientResponseSchema)
		.mutation(async ({ input, ctx }) => await manager.init(ctx.db, input))
})

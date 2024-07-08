import { observable } from "@trpc/server/observable"

import { Intent } from "@/src/core"
import {
	IntentInput,
	IntentInputSchema,
	IntentOutputSchema,
	StreamInputSchema
} from "@/src/lib"
import { createTRPCRouter, protectedProcedure } from "@/src/server/trpc"

const manager = new Intent()

export const intent = createTRPCRouter({
	// Submit a new signed intent to the Plug network.
	init: protectedProcedure
		.input(IntentInputSchema)
		.output(IntentOutputSchema)
		.mutation(({ input, ctx }) => manager.init(ctx.db, ctx.emitter, input)),
	// Announce intents to the Plug network subscribers that have set a
	// scope for intents they are willing to solve for.
	on: protectedProcedure
		.input(StreamInputSchema)
		.subscription(async ({ input, ctx }) =>
			manager.on(ctx.db, ctx.emitter, input)
		)
})

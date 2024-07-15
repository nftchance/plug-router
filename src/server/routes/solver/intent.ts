import { Intent } from "@/src/core"
import {
	IntentInfiniteRequestSchema,
	IntentInfiniteResponseSchema,
	IntentRequestSchema,
	IntentResponseSchema,
	IntentStreamRequestSchema
} from "@/src/lib"
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure
} from "@/src/server"

const intent = new Intent()

export default createTRPCRouter({
	// Submit a new signed intent to the Plug network.
	create: publicProcedure
		.input(IntentRequestSchema)
		.output(IntentResponseSchema)
		.mutation(async ({ input, ctx }) => await intent.create(ctx, input)),
	// Announce intents to the Plug network subscribers that have set a
	// scope for intents they are willing to solve for.
	onCreate: protectedProcedure
		.input(IntentStreamRequestSchema)
		.subscription(({ input, ctx }) => intent.onCreate(ctx, input)),
	// Get an infinite stream of intents that have been created in a
	// given scope with pagination, limit and cursor support.
	infinite: protectedProcedure
		.input(IntentInfiniteRequestSchema)
		.output(IntentInfiniteResponseSchema)
		.query(async ({ input, ctx }) => await intent.infinite(ctx, input))
})

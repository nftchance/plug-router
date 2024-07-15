import { Simulate } from "@/src/core"
import {
	SimulationBundleDataSchema,
	SimulationBundleRequestSchema,
	SimulationDataSchema,
	SimulationRequestSchema
} from "@/src/lib/types"
import { createTRPCRouter, protectedProcedure } from "@/src/server/router"

const simulate = new Simulate()

export default createTRPCRouter({
	// Simulate a single transaction.
	single: protectedProcedure
		.input(SimulationRequestSchema)
		.output(SimulationDataSchema)
		.mutation(async ({ input }) => await simulate.simulate(input)),
	// Simulate a bundle of transactions.
	bundle: protectedProcedure
		.input(SimulationBundleRequestSchema)
		.output(SimulationBundleDataSchema)
		.mutation(async ({ input }) => await simulate.simulationBundle(input))
})

import { Simulator } from "@/src/core"
import {
	SimulationBundleDataSchema,
	SimulationBundleRequestSchema,
	SimulationDataSchema,
	SimulationRequestSchema
} from "@/src/lib"
import { createTRPCRouter, protectedProcedure } from "@/src/server/trpc"

const simulator = new Simulator()

export const simulate = createTRPCRouter({
	// Simulate a single transaction.
	single: protectedProcedure
		.input(SimulationRequestSchema)
		.output(SimulationDataSchema)
		.mutation(async ({ input }) => await simulator.simulate(input)),
	// Simulate a bundle of transactions.
	bundle: protectedProcedure
		.input(SimulationBundleRequestSchema)
		.output(SimulationBundleDataSchema)
		.mutation(async ({ input }) => await simulator.simulationBundle(input))
})

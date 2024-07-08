import { z } from "zod"

export const SimulationRequestSchema = z
	.object({
		chainId: z.bigint(),
		from: z.string(),
		to: z.string(),
		gasLimit: z.number()
	})
	.merge(
		z
			.object({
				data: z.string(),
				value: z.bigint(),
				accessList: z.array(
					z.object({
						address: z.string(),
						storageKeys: z.array(z.string())
					})
				),
				blockNumber: z.number(),
				blockTimestamp: z.number(),
				stateOverrides: z.record(
					z.string(),
					z
						.object({
							balance: z.bigint(),
							nonce: z.number(),
							code: z.string(),
							state: z.record(z.string(), z.bigint()),
							stateDiff: z.record(z.string(), z.bigint())
						})
						.partial()
				),
				formatTrace: z.boolean()
			})
			.partial()
	)

export const SimulationBundleRequestSchema = z.array(SimulationRequestSchema)

export const SimulationResponseSchema = z
	.object({
		simulationId: z.string(),
		success: z.boolean(),
		gasUsed: z.number(),
		blockNumber: z.number(),
		trace: z.array(
			z.object({
				callType: z.enum([
					"CALL",
					"STATICCALL",
					"CALLCODE",
					"DELEGATECALL",
					"CREATE",
					"CREATE2"
				]),
				from: z.string(),
				to: z.string(),
				value: z.string()
			})
		),
		bytes: z.string()
	})
	.merge(
		z.object({
			logs: z.array(
				z.object({
					topics: z.array(z.string()),
					address: z.string(),
					data: z.string()
				})
			),
			exitReason: z.enum([
				// Success codes
				"Continue",
				"Stop",
				"Return",
				"SelfDestruct",

				// Revert codes
				"Revert",
				"CallTooDeep",
				"OutOfFund",

				// Error codes
				"OutOfGas",
				"OpcodeNotFound",
				"CallNotAllowedInsideStatic",
				"InvalidOpcode",
				"InvalidJump",
				"InvalidMemoryRange",
				"NotActivated",
				"StackUnderflow",
				"StackOverflow",
				"OutOfOffset",
				"FatalExternalError",
				"GasMaxFeeGreaterThanPriorityFee",
				"PrevrandaoNotSet",
				"GasPriceLessThanBasefee",
				"CallerGasLimitMoreThanBlock",

				// EIP-3607 -- Reject transactions from senders with deployed code
				"RejectCallerWithCode",
				"LackOfFundForGasLimit",
				"CreateCollision",
				"OverflowPayment",
				"PrecompileError",
				"NonceOverflow",

				// Create initcode exceeds limit (runtime)
				"CreateContractLimit",

				// Error on created contract that beings with 0xEF
				"CreateContractWithEF"
			]),
			formattedTrace: z.string()
		})
	)

export const SimulationBundleResponseSchema = z.array(SimulationResponseSchema)

export type SimulationRequest = z.infer<typeof SimulationRequestSchema>
export type SimulationBundleRequest = z.infer<
	typeof SimulationBundleRequestSchema
>
export type SimulationResponse = z.infer<typeof SimulationResponseSchema>
export type SimulationBundleResponse = z.infer<
	typeof SimulationBundleResponseSchema
>

export const SimulationDataSchema = SimulationResponseSchema.merge(
	z.object({
		logs: z.array(
			z.object({
				index: z.number(),
				topics: z.array(z.string()),
				address: z.string(),
				data: z.string()
			})
		),
		delta: z.map(z.string(), z.bigint())
	})
)

export const SimulationBundleDataSchema = z.array(SimulationDataSchema)

export type SimulationData = z.infer<typeof SimulationDataSchema>
export type SimulationBundleData = z.infer<typeof SimulationBundleDataSchema>

export type TransactionSimulator = {
	simulate(data: SimulationRequest): Promise<SimulationResponse>
	simulationBundle(
		data: SimulationBundleRequest
	): Promise<SimulationBundleResponse>
}

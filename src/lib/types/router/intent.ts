import { z } from "zod"

import { chains, literalUnion } from "@/src/lib"
import {
	AddressSchema,
	AddressesSchema,
	Bytes32Schema,
	BytesSchema,
	SignatureSchema
} from "@/src/lib/types"

export const IntentRequestSchema = z.object({
	plugs: z.object({
		socket: AddressSchema,
		solver: AddressSchema,
		plugs: z
			.array(
				z.object({
					target: AddressSchema,
					value: z.bigint().min(BigInt(0)),
					data: BytesSchema
				})
			)
			.min(1),
		salt: Bytes32Schema
	}),
	chainId: literalUnion(chains.map(chain => chain.id)),
	signer: AddressSchema,
	signature: SignatureSchema
})
export const IntentResponseSchema = IntentRequestSchema.merge(
	z.object({
		id: z.string(),
		createdAt: z.date(),
		updatedAt: z.date(),
		// NOTE: This is a workaround that recasts the chainId to a number
		//       because prisma does not return literals.
		chainId: z.number()
	})
)

export type IntentRequest = z.infer<typeof IntentRequestSchema>
export type IntentResponse = z.infer<typeof IntentResponseSchema>

export const IntentStreamRequestSchema = z
	.object({
		lastEventId: z.string().optional(),
		signer: AddressesSchema.optional(),
		socket: AddressesSchema.optional()
	})
	.optional()
export const IntentStreamResponseSchema = z.object({
	id: z.string(),
	data: IntentResponseSchema
})

export type IntentStreamRequest = z.infer<typeof IntentStreamRequestSchema>
export type IntentStreamResponse = z.infer<typeof IntentStreamResponseSchema>

export const IntentInfiniteRequestSchema = z.object({
	cursor: z.date().optional(),
	take: z.number().min(1).max(100).optional(),
	signer: AddressesSchema.optional(),
	socket: AddressesSchema.optional()
})
export const IntentInfiniteResponseSchema = z.object({
	items: z.array(IntentResponseSchema),
	cursor: z.date().optional()
})

export type IntentInfiniteRequest = z.infer<typeof IntentInfiniteRequestSchema>
export type IntentInfiniteResponse = z.infer<
	typeof IntentInfiniteResponseSchema
>

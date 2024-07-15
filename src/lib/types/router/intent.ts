import { z } from "zod"

import { AddressSchema, AddressesSchema, SignatureSchema } from "@/src/lib"

export const IntentRequestSchema = z.object({
	socket: AddressSchema,
	solver: AddressSchema,
	actions: z.array(z.string()).min(1),
	signer: AddressSchema,
	signature: SignatureSchema
})
export const IntentResponseSchema = IntentRequestSchema.merge(
	z.object({
		id: z.string(),
		createdAt: z.date(),
		updatedAt: z.date()
	})
)

export type IntentRequest = z.infer<typeof IntentRequestSchema>
export type IntentResponse = z.infer<typeof IntentResponseSchema>

export const IntentStreamRequestSchema = z.object({
	lastEventId: z.string().optional(),
	signer: AddressesSchema.optional(),
	socket: AddressesSchema.optional()
})

export type IntentStreamRequest = z.infer<typeof IntentStreamRequestSchema>

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

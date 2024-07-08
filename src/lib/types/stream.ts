import { z } from "zod"

import { AddressesSchema, AddressSchema } from "@/src/lib/types/utils"

export const IntentInputSchema = z.object({
	solver: AddressSchema,
	signer: AddressSchema,
	socket: AddressSchema,
	actions: z.array(z.string()).min(1)
})

export const IntentOutputSchema = z.object({
	success: z.boolean()
})

export type IntentInput = z.infer<typeof IntentInputSchema>
export type IntentOutput = z.infer<typeof IntentOutputSchema>

export const StreamInputSchema = z.object({
	apiKeys: z.array(z.string()).min(1),
	signer: AddressesSchema.optional(),
	socket: AddressesSchema.optional()
})

export type StreamInput = z.infer<typeof StreamInputSchema>

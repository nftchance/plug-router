import { z } from "zod"

import { AddressSchema } from "@/src/lib/types/utils"

export const ClientRequestSchema = z.object({
	address: AddressSchema,
	signature: z.string().refine(value => value.startsWith("0x"))
})

export const ClientResponseSchema = z.object({
	apiKey: z.string()
})

export type ClientRequest = z.infer<typeof ClientRequestSchema>
export type ClientResponse = z.infer<typeof ClientResponseSchema>

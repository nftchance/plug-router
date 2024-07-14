import { z } from "zod"

import { Prisma } from "@prisma/client"

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

export const client = Prisma.validator<Prisma.ClientDefaultArgs>()({})
export type Client = Prisma.ClientGetPayload<typeof client>

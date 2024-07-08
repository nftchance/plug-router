import { z } from "zod"

export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/)
export const AddressesSchema = z.union([AddressSchema, z.array(AddressSchema)])

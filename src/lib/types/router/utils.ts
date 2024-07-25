import { z } from "zod"

export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/)
export const AddressesSchema = z.union([AddressSchema, z.array(AddressSchema)])

export type Address = z.infer<typeof AddressSchema>
export type Addresses = z.infer<typeof AddressesSchema>

export const SignatureSchema = z.string().regex(/^0x[a-fA-F0-9]{130}$/)
export type Signature = z.infer<typeof SignatureSchema>

export const Bytes32Schema = z.string().regex(/^0x[a-fA-F0-9]{64}$/)
export type Bytes32 = z.infer<typeof Bytes32Schema>

export const BytesSchema = z.string().regex(/^0x[a-fA-F0-9]*$/)
export type Bytes = z.infer<typeof BytesSchema>

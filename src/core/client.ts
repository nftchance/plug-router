import { randomUUID } from "crypto"
import { recoverMessageAddress } from "viem"

import { PrismaClient } from "@prisma/client"
import { TRPCError } from "@trpc/server"

import { ClientRequest } from "@/src/lib"

export class Client {
	private readonly message = (address: string) =>
		`Initialize ${address} as a solver in the Plug network.`

	init = async (db: PrismaClient, input: ClientRequest) => {
		const { address, signature } = input

		const signatureAddress = await recoverMessageAddress({
			message: this.message(address),
			signature: signature as `0x${string}`
		})

		if (signatureAddress != address) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Invalid signature for address ${address} provided.`
			})
		}

		const { apiKey } = await db.client.upsert({
			where: { address: address },
			create: {
				address: address
			},
			update: {
				apiKey: randomUUID()
			}
		})

		return { apiKey }
	}
}

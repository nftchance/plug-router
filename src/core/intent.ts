import EventEmitter from "events"

import { PrismaClient } from "@prisma/client"
import { observable } from "@trpc/server/observable"

import { IntentInput, StreamInput } from "@/src/lib"

export class Intent {
	static STREAM_INTENT_KEY = "intent"

	public readonly init = async (
		db: PrismaClient,
		emitter: EventEmitter,
		input: IntentInput
	) => {
		// TODO: Confirm the signature is valid -- Will need to support base
		// signature validation as well as Merkle tree validation.
		// 		NOTE: This is pending the audit changes to be pushed into the
		//  	main protocol as the signature validation has been refactored
		//  	to be more efficient and less complex. This will remove the
		//  	need for the signature validation to make an onchain call.
		//      	NOTE: The main benefit of the new architecture is that the
		//          signatures can now be validated offchain without relying
		//          on additional libraries like 0xSequence.

		const recoveredSigner = ""

		if (recoveredSigner !== input.signer) {
			return { success: false }
		}

		emitter.emit(Intent.STREAM_INTENT_KEY, input)

		return { success: true }
	}

	public readonly on = async (
		db: PrismaClient,
		emitter: EventEmitter,
		input: StreamInput
	) => {
		const solvers = await db.client.findMany({
			where: {
				apiKey: {
					in: input.apiKeys
				}
			}
		})

		const solverAddresses = solvers.map(solver => solver.address)

		return observable<IntentInput>(emit => {
			const handleStream = (intent: IntentInput) => {
				// Filter down to intents that have defined this Solver so
				// that other Solvers can't listen to intents that are
				// intended for another executing party.
				const validSolver = solverAddresses.includes(intent.solver)

				if (validSolver === false) return

				// Filter down to signers that the user has scoped to:
				// • Listening to intents from all signers.
				// • Listening to intents for a specific signer.
				// • Listening to intents for a specific list of signers.
				const validSigner =
					input.signer === undefined ||
					input.signer === intent.signer ||
					input.signer.includes(intent.signer)

				if (validSigner === false) return

				// Filter down to sockets that the user has scoped to:
				// • Listening to intents from all sockets.
				// • Listening to intents for a specific socket.
				// • Listening to intents for a specific list of sockets.
				const validSocket =
					input.socket === undefined ||
					input.socket === intent.socket ||
					input.socket.includes(intent.socket)

				if (validSocket === false) return

				emit.next(intent)
			}

			emitter.on(Intent.STREAM_INTENT_KEY, handleStream)

			return () => emitter.off(Intent.STREAM_INTENT_KEY, handleStream)
		})
	}
}

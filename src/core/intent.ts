import EventEmitter from "events"

import { PrismaClient } from "@prisma/client"
import { TRPCError, sse } from "@trpc/server"

import {
	Address,
	Addresses,
	IntentInfiniteRequest,
	IntentInfiniteResponse,
	IntentRequest,
	IntentResponse,
	IntentStreamRequest,
	streamToAsyncIterable
} from "@/src/lib"

export class Intent {
	static STREAM_INTENT_KEY = "intent"

	public readonly create = async (
		db: PrismaClient,
		emitter: EventEmitter,
		data: IntentRequest
	): Promise<IntentResponse> => {
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

		if (recoveredSigner !== data.signer) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Recovered signer ${recoveredSigner} does not match provided signer ${data.signer}.`
			})
		}

		const intent = await db.intent.create({
			data
		})

		emitter.emit(Intent.STREAM_INTENT_KEY, data)

		return intent
	}

	public readonly onCreate = async function* (
		db: PrismaClient,
		emitter: EventEmitter,
		input: IntentStreamRequest
	) {
		let cursor: Date | undefined = undefined

		if (input.lastEventId) {
			const intentById = await db.intent.findFirst({
				where: {
					id: input.lastEventId
				}
			})
			cursor = intentById?.createdAt
		}

		const solvers = await db.client.findMany({
			where: {
				apiKey: {
					in: input.apiKeys
				}
			}
		})

		const solverAddresses = solvers.map(solver => solver.address)

		if (solverAddresses.length === 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "No solver clients are available to listen to intents."
			})
		}

		const where = getWhere(
			input.signer,
			input.socket,
			solverAddresses,
			cursor
		)

		let unsubscribe = () => {}

		const stream = new ReadableStream<IntentResponse>({
			async start(controller) {
				const handleCreate = (intent: IntentResponse) => {
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

					controller.enqueue(intent)
				}

				emitter.on(Intent.STREAM_INTENT_KEY, handleCreate)
				unsubscribe = () => {
					emitter.off(Intent.STREAM_INTENT_KEY, handleCreate)
				}

				const intents: Array<IntentResponse> = await db.intent.findMany(
					{
						where,
						orderBy: {
							createdAt: "asc"
						}
					}
				)

				for (const intent of intents) {
					controller.enqueue(intent)
				}
			},
			cancel() {
				unsubscribe()
			}
		})

		for await (const intent of streamToAsyncIterable(stream)) {
			yield sse({
				id: intent.id,
				data: intent
			})
		}
	}

	public readonly infinite = async (
		db: PrismaClient,
		input: IntentInfiniteRequest
	): Promise<IntentInfiniteResponse> => {
		const solvers = await db.client.findMany({
			where: {
				apiKey: {
					in: input.apiKeys
				}
			}
		})

		const solverAddresses = solvers.map(solver => solver.address)

		const where = getWhere(
			input.signer,
			input.socket,
			solverAddresses,
			input.cursor
		)

		const orderBy = {
			createdAt: "desc"
		} as const

		const take = input.take ?? 20

		const page = await db.intent.findMany({
			where: {
				...where,
				createdAt: input.cursor
					? {
							lte: input.cursor
						}
					: undefined
			},
			orderBy,
			take: take + 1
		})

		const items = page.reverse()
		let cursor: typeof input.cursor = undefined

		if (items.length > take) {
			const prev = items.shift()
			cursor = prev!.createdAt
		}

		return { items, cursor }
	}
}

export const getWhere = (
	signers?: Addresses,
	sockets?: Addresses,
	solvers?: Array<Address>,
	cursor?: Date
) => {
	const signer =
		signers === undefined
			? undefined
			: Array.isArray(signers)
				? { in: signers }
				: signers
	const socket =
		sockets === undefined
			? undefined
			: Array.isArray(sockets)
				? { in: sockets }
				: sockets
	const solver = { in: solvers }
	const createdAt = cursor ? { gt: cursor } : undefined

	return {
		signer,
		socket,
		solver,
		createdAt
	}
}

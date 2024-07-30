import { createPublicClient, extractChain, http } from "viem"

import { Client } from "@prisma/client"
import { TRPCError, sse } from "@trpc/server"

import {
	Addresses,
	IntentInfiniteRequest,
	IntentInfiniteResponse,
	IntentRequest,
	IntentResponse,
	IntentStreamRequest,
	LIVE_PLUGS_TYPES,
	chains,
	streamToAsyncIterable
} from "@/src/lib"
import { AuthenticatedContext, Context } from "@/src/server"

export class Intent {
	static STREAM_INTENT_KEY = "intent"

	private readonly domain = (
		chainId: (typeof chains)[number]["id"],
		address: string,
		name = "Plug",
		version = "1"
	) => {
		const client = createPublicClient({
			chain: extractChain({
				chains,
				id: chainId
			}),
			transport: http()
		})

		const domain = {
			name,
			version,
			chainId,
			verifyingContract: address as `0x${string}`
		}

		return { client, domain }
	}

	public readonly verify = async (data: IntentRequest) => {
		const { client, domain } = this.domain(1, data.plugs.socket)

		return await client.verifyTypedData({
			address: data.signer as `0x${string}`,
			types: LIVE_PLUGS_TYPES,
			primaryType: "Plugs",
			domain,
			message: data.plugs,
			signature: data.signature as `0x${string}`
		})
	}

	public readonly create = async (
		ctx: Context,
		data: IntentRequest
	): Promise<IntentResponse> => {
		if ((await this.verify(data)) === false) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Invalid signer/signature pair provided.`
			})
		}

		const intent = await ctx.db.livePlugs.create({
			data: {
				...data,
				plugs: {
					create: {
						...data.plugs,
						plugs: {
							createMany: {
								data: data.plugs.plugs
							}
						}
					}
				}
			},
			include: { plugs: { include: { plugs: true } } }
		})

		ctx.emitter.emit(Intent.STREAM_INTENT_KEY, data)

		return intent
	}

	public readonly onCreate = async function* (
		ctx: AuthenticatedContext,
		input: IntentStreamRequest
	) {
		let cursor: Date | undefined = undefined

		if (input && input.lastEventId) {
			const intentById = await ctx.db.livePlugs.findFirst({
				where: {
					id: input.lastEventId
				}
			})
			cursor = intentById?.createdAt
		}

		let unsubscribe = () => {}

		const stream = new ReadableStream<IntentResponse>({
			async start(controller) {
				const handleCreate = (intent: IntentResponse) => {
					// Filter down to intents that have defined the authenticated
					// client as the solver for the intent.
					if (ctx.client.address !== intent.plugs.solver) return

					if (input) {
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
							input.socket === intent.plugs.socket ||
							input.socket.includes(intent.plugs.socket)

						if (validSocket === false) return
					}

					controller.enqueue(intent)
				}

				ctx.emitter.on(Intent.STREAM_INTENT_KEY, handleCreate)
				unsubscribe = () => {
					ctx.emitter.off(Intent.STREAM_INTENT_KEY, handleCreate)
				}

				const intents: Array<IntentResponse> =
					await ctx.db.livePlugs.findMany({
						where: {
							...getWhere(
								ctx.client,
								input?.signer,
								input?.socket
							),
							createdAt: cursor ? { gt: cursor } : undefined
						},
						include: { plugs: { include: { plugs: true } } },
						orderBy: {
							createdAt: "asc"
						}
					})

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
		ctx: AuthenticatedContext,
		input: IntentInfiniteRequest
	): Promise<IntentInfiniteResponse> => {
		const take = input.take ?? 20

		const page = await ctx.db.livePlugs.findMany({
			where: {
				...getWhere(ctx.client, input.signer, input.socket),
				createdAt: input.cursor
					? {
							lte: input.cursor
						}
					: undefined
			},
			include: { plugs: { include: { plugs: true } } },
			orderBy: {
				createdAt: "desc"
			},
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
	client: Client,
	signers?: Addresses,
	sockets?: Addresses
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

	return {
		plugs: {
			socket,
			solver: client.address
		},
		signer
	}
}

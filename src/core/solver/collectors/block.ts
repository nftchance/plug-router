import { providers } from "ethers"
import { EventEmitter } from "node:events"

import { Collector } from "@/src/core/solver/collectors"

const key = "NewBlock" as const

export class BlockCollector extends Collector<
	typeof key,
	Pick<providers.Block, "hash" | "number">
> {
	constructor(public readonly client: providers.WebSocketProvider) {
		super(key)
	}

	getCollectionStream = async (emitter: EventEmitter) => {
		this.client.on("block", async (blockNumber: number) => {
			try {
				const block = await this.client.getBlock(blockNumber)

				const collection = {
					hash: block.hash,
					number: block.number
				}

				this.emit(emitter, collection)
			} catch (err) {
				console.error(`[${this.key}] Failed retrieving block.`)
			}
		})
	}
}

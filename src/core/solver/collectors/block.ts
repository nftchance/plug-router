import { providers } from "ethers"
import { EventEmitter } from "node:events"

import { Collector } from "@/src/core/solver/collectors"

const key = "NewBlock" as const

export class BlockCollector extends Collector<typeof key, providers.Block> {
	constructor(public readonly client: providers.WebSocketProvider) {
		super(key)
	}

	getCollectionStream = async (emitter: EventEmitter) => {
		this.client.on("block", async (blockNumber: number) => {
			const block = await this.client.getBlock(blockNumber)

			this.emit(emitter, block)
		})
	}
}

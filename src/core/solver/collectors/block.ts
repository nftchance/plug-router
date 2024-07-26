import { Block, WebSocketProvider } from "ethers"
import { EventEmitter } from "node:events"

import { Collector } from "@/src/core/solver/collectors"

const key = "NewBlock" as const

export class BlockCollector extends Collector<typeof key, Block> {
	constructor(public readonly client: WebSocketProvider) {
		super(key)
	}

	getCollectionStream = async (emitter: EventEmitter) => {
		this.client.on("block", async (blockNumber: number) => {
			const block = await this.client.getBlock(blockNumber)

			if (block === null) return

			this.emit(emitter, block)
		})
	}
}

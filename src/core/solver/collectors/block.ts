import { providers } from "ethers"
import { EventEmitter } from "node:events"

import { Collector } from "@/src/core"

const key = "NewBlock" as const

export type BlockCollection = {
	hash: string
	number: number
}

export class BlockCollector extends Collector<typeof key, BlockCollection> {
	constructor(public readonly client: providers.WebSocketProvider) {
		super(key)
	}

	getCollectionStream = async (emitter: EventEmitter) => {
		this.client.on("block", async (blockNumber: number) => {
			try {
				const block = await this.client.getBlock(blockNumber)

				this.emit(emitter, {
					hash: block.hash,
					number: block.number
				})
			} catch (err) {
				console.error(`[${this.key}] Failed retrieving block.`)
			}
		})
	}
}

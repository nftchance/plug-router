import { EventEmitter } from "node:events"

import { Collector } from "@/src/core/solver/collectors"
import { IntentStreamRequest, IntentStreamResponse } from "@/src/lib"
import { createPlugSDK } from "@/src/server"

const key = "NewIntent" as const

export class IntentCollector extends Collector<
	typeof key,
	IntentStreamResponse
> {
	constructor(
		public readonly sdk: ReturnType<typeof createPlugSDK>,
		public readonly options: IntentStreamRequest = undefined
	) {
		super(key)
	}

	getCollectionStream = async (emitter: EventEmitter) => {
		this.sdk.intent.onCreate.subscribe(this.options, {
			onData: data => {
				this.emit(emitter, data)
			}
		})
	}
}

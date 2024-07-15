import { EventEmitter } from "node:events"

export abstract class Collector<TKey extends string, TCollection> {
	constructor(public readonly key: TKey) {}

	emit(stream: EventEmitter, collection: TCollection) {
		try {
			stream.emit("Collection", { key: this.key, collection })
		} catch (err) {
			console.error(`[${this.key}]: ${err}`)
		}
	}

	abstract getCollectionStream: (stream: EventEmitter) => Promise<void>
}

export * from "./block"

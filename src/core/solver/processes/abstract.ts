import { Collector, Executor } from "@/src/core"

export abstract class Process<
	TCollector extends Collector<string, unknown>,
	TExecutor extends Executor<`${string}Execution`, unknown>
> {
	constructor(public readonly key: string) {}

	syncState = async () =>
		console.warn(`[${this.key}]: requires no state sync.`)

	abstract processCollection: <TKey extends TCollector["key"]>(
		key: TKey,
		collection: Parameters<TCollector["emit"]>[1]
	) => Promise<{
		key: TExecutor["key"]
		execution: Parameters<TExecutor["execute"]>[0]
	} | void>
}

import { Collector, Executor } from "@/src/core"
import { Collection, Execution } from "@/src/lib"

export abstract class Process<
	TCollector extends Collector<string, any>,
	TExecutor extends Executor<`${string}Execution`, any>,
	TCollection extends Collection<TCollector>,
	TExecution extends Execution<TExecutor>
> {
	constructor(public readonly key: string) {}

	syncState = async () =>
		console.warn(`[${this.key}]: requires no state sync.`)

	abstract processCollection: <TKey extends TCollector["key"]>(
		key: TKey,
		collection: TCollection
	) => Promise<{
		key: TExecutor["key"]
		execution: TExecution
	} | void>
}

import {
	BlockCollector,
	IntentCollector,
	MempoolExecutor
} from "@/src/core/solver"
import { Process } from "@/src/core/solver/processes/abstract"
import { Collection, Execution } from "@/src/lib"

export class IntentSolver<
	TCollector extends BlockCollector | IntentCollector,
	TExecutor extends MempoolExecutor,
	TCollection extends Collection<TCollector>,
	TExecution extends Execution<TExecutor>
> extends Process<TCollector, TExecutor, TCollection, TExecution> {
	constructor() {
		super("IntentSolver")
	}

	processCollection = async <TKey extends TCollector["key"]>(
		key: TKey,
		collection: TCollection
	) => {
		switch (key) {
			case "NewIntent":
				const intent = collection as Collection<IntentCollector>
				const execution = await this.processIntent(intent)

				if (execution === undefined) return

				return {
					key: MempoolExecutor.key,
					execution
				}
			case "NewBlock":
				const block = collection as Collection<BlockCollector>
				await this.processBlock(block)
		}

		return
	}

	private processBlock = async (_: Collection<BlockCollector>) => {}

	private processIntent = async (_: Collection<IntentCollector>) => {}
}

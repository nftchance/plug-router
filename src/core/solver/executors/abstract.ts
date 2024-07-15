export abstract class Executor<TKey extends `${string}Execution`, TExecution> {
	constructor(public readonly key: TKey) {}

	abstract execute: (execution: TExecution) => Promise<void>
}

import { Collector, Executor } from "@/src/core"
import { DEFAULT_NETWORKS, References } from "@/src/lib"

export type Collectors = Array<Collector<string, unknown>>
export type Executors = Array<Executor<`${string}Execution`, unknown>>
export type Processes = Record<string, unknown>

export type Retries = {
	retries: number
	delay: number
}

export type NetworkBase = {
	key: string
	rpc: `wss://${string}` | `https://${string}`
	explorer: string
	explorerHasApiKey: boolean
}

export type NetworkReferences = Partial<{
	explorerApiKey: string
}> & {
	artifacts: string
	references: References
}

export type NetworkConfig = {
	collectors: Collectors
	executors: Executors
	processes: Processes
}

export type Network = NetworkBase & NetworkReferences & NetworkConfig

export type BaseConfig = Partial<Retries> &
	(
		| Record<
				"networks",
				Record<keyof typeof DEFAULT_NETWORKS, Partial<Network>>
		  >
		| undefined
	)

export type Config = Retries & {
	networks: Record<keyof typeof DEFAULT_NETWORKS, Network>
}

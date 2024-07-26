import { Collector, Executor } from "@/src/core"
import { DEFAULT_NETWORKS, References } from "@/src/lib"

export type Collectors = Array<Collector<any, any>>
export type Executors = Array<Executor<any, any>>
export type Processes = Record<string, any>

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

export type BaseSolverConfig = Partial<Retries> &
	(
		| Record<"networks", Record<keyof typeof DEFAULT_NETWORKS, Network>>
		| undefined
	)

export type SolverConfig = Retries & {
	networks: Record<keyof typeof DEFAULT_NETWORKS, Network>
}

import EventEmitter from "node:events"

import { Engine } from "@/src/core"
import { configs, getProcess } from "@/src/lib"

type Props = Partial<{
	process: string
}> &
	Parameters<typeof configs>[0]

export const start = async (props: Props = {}) => {
	const { process: processName } = props

	let engines = []

	for (const config of await configs(props)) {
		for (const networkIndex in config.networks) {
			const network = config.networks[networkIndex]

			if (network === undefined) continue

			// * Save a reference here because the user may be running a
			//   specific process and we don't want to run all of them.
			let processes = network.processes

			if (processName) {
				const process = getProcess(network.processes, processName)

				if (process === undefined) continue

				processes = { [processName]: process }
			}

			if (Object.keys(network.processes).length === 0) continue

			// * Run the Engine with a specific or all processes.
			engines.push(
				new Engine(
					network,
					processes,
					new EventEmitter(),
					config.retries,
					config.delay
				)
			)
		}
	}

	if (engines.length === 0) {
		console.warn("No Processes or Engines to run.")
		process.exit()
	}

	// * Run all the engines and wait for them all to settle. They will
	//   be long running processes though, so we don't really expect them
	//   all to settle. If they do, that means they've errored out or
	//   completed and so the entire process should exit.
	await Promise.all(engines.map(engine => engine.run()))
}

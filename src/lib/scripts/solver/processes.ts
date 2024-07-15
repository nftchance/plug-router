import { configs, getProcessNames } from "@/src/lib"

type Props = Parameters<typeof configs>[number]

export const processes = async (props: Props = {}) => {
	const processes = []

	for (const config of await configs(props)) {
		for (const networkId in config.networks) {
			const network = config.networks[networkId]

			if (
				network === undefined ||
				Object.keys(network.processes).length === 0
			)
				continue

			const names = getProcessNames(network.processes)

			for (const name of names) {
				processes.push({
					chainId: networkId,
					process: name
				})
			}
		}
	}

	console.info(
		`${processes.length} Process${
			processes.length > 1 && "es"
		} found in configuration.`
	)

	console.table(processes)

	process.exit()
}

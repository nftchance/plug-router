import { configs, generateReferences } from "@/src/lib"

type Props = Parameters<typeof configs>[number]

export const references = async (props: Props = {}) => {
	for (const config of await configs(props)) {
		for (const networkIndex in config.networks) {
			const network = config.networks[networkIndex]

			if (network === undefined || network.references === undefined)
				return

			await generateReferences(network)
		}
	}

	process.exit()
}

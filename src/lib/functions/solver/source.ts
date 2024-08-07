import axios from "axios"

import { ExplorerResponse, Network } from "@/src/lib/types"

const escapeResults = ["Contract source code not verified"]
const terminateResults = ["Invalid API Key"]
const sleepResults = ["Rate limit"]

export const getSource = async (
	network: Network,
	name: string,
	address: `0x${string}`,
	remainingRetries = 3
): Promise<ExplorerResponse> => {
	let contract = {
		network,
		name: "",
		abi: undefined,
		source: undefined,
		additionalSources: []
	}

	if (network.explorerHasApiKey && network.explorerApiKey === undefined) {
		console.error(
			`Explorer API key is not defined, but is required for high throughput.`
		)
		return contract
	}

	const url = `${
		network.explorer
	}?module=contract&action=getsourcecode&address=${address}${
		network.explorerApiKey ? `&apikey=${network.explorerApiKey}` : ""
	}`

	const response = await axios.get(url)
	const message = response.data.message
	let result = response.data.result

	/// * Request submit to the Explorer was not successful.
	if (message === "NOTOK") {
		const shouldRetry =
			terminateResults.every(
				termination =>
					result.toLowerCase().includes(termination.toLowerCase()) ===
					false
			) && remainingRetries > 0

		console.error(`Failed to get source for ${name}: ${result}.`)

		if (!shouldRetry) return contract

		console.info(`Retrying ${remainingRetries} more times before aborting.`)

		/// * Before retrying, make sure we are not being rate limited. If so, sleep
		/// * for a bit before retrying.
		const shouldSleep = sleepResults.some(result =>
			result.toLowerCase().includes(result.toLowerCase())
		)

		if (shouldSleep) {
			console.info(`Sleeping for 5 seconds before retrying.`)
			await new Promise(resolve => setTimeout(resolve, 5000))
		}

		return getSource(network, name, address, remainingRetries - 1)
	}
	/// * Request was successful, but the contract source code could not be retrieved.
	else if (
		escapeResults.some(result =>
			response.data.result[0].ABI.includes(result)
		)
	) {
		console.error(`Source code not verified for ${name}.`)

		return contract
	}

	/// * Request was successful, and the contract source code was retrieved.
	result = result[0]
	const abi: string = result.ABI
	const contractName: string = result.ContractName
	const source: string = result.SourceCode

	/// * These are sources that are used as dependencies within the base contract.
	const additionalSources = result.hasOwnProperty("AdditionalSources")
		? result.AdditionalSources
		: []

	return {
		network,
		abi,
		name: contractName,
		source,
		additionalSources
	}
}

export const getSources = async (
	network: Network
): Promise<Array<ExplorerResponse>> => {
	if (network.references === undefined) return []

	return await Promise.all(
		Object.entries(network.references || []).map(
			async ([name, address]) => {
				const { abi, source, additionalSources } = await getSource(
					network,
					name,
					// @ts-ignore
					address
				)

				return {
					network,
					name,
					address,
					abi,
					source,
					additionalSources
				}
			}
		)
	)
}

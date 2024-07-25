import {
	encodeFunctionData,
	getAddress,
	isAddress,
	toHex,
	zeroAddress
} from "viem"

import { Action, actions, mainnet } from "@/src/lib"

const chainSeperator = ":" as const
const actionSeperator = "." as const

type ActionString =
	`${number}${typeof chainSeperator}${string}${typeof actionSeperator}${string}${typeof actionSeperator}${string}`

type WorkflowAction = {
	id: ActionString
	value?: number
	args?: Array<unknown>
}

const intent: Array<WorkflowAction> = [{ id: `${mainnet}:plug.plug.baseFee` }]

export const getActionAddress = (
	chainId: number,
	action: Action
): `0x${string}` | undefined => {
	let address: string | undefined = undefined

	if (Array.isArray(action.address)) {
		const domainDefinition = action.address.find(
			address => address.split(":")[0] === chainId.toString()
		)

		if (domainDefinition === undefined) return undefined

		address = domainDefinition.split(":")[1]

		if (address === undefined) return undefined
	} else {
		if (action.address.split(":")[0] !== chainId.toString())
			return undefined

		address = action.address.split(":")[1]
	}

	if (address === undefined || isAddress(address) === false) return undefined

	return getAddress(address)
}

export const getPlug = ({ id, value, args }: WorkflowAction) => {
	const [serviceProviderKey, actionProviderKey, actionKey]: Array<
		string | undefined
	> = id.split(".")

	if (!serviceProviderKey || !actionProviderKey || !actionKey)
		throw new Error(`Invalid action string format: ${id}`)

	const action =
		actions?.[serviceProviderKey]?.[actionProviderKey]?.actions?.[actionKey]

	if (action === undefined) throw new Error(`Invalid action lookup: ${id}.`)

	const chainId = parseInt(id.split(chainSeperator)[0] ?? "")

	if (isNaN(chainId)) throw new Error(`Invalid chain id definition: ${id}.`)

	const address = getActionAddress(chainId, action)

	if (address === undefined) throw new Error(`Invalid action domain: ${id}.`)

	const functionName = action.abi.split("(")[0]?.replace("function ", "")

	if (functionName === undefined)
		throw new Error(`Invalid function name: ${action.abi}`)

	return {
		target: address,
		value: value ?? 0,
		data: encodeFunctionData({
			abi: [action.abi],
			functionName,
			args
		})
	}
}

export const getPlugs = (
	socket: `0x${string}`,
	solver: `0x${string}`,
	actions: Array<WorkflowAction>
) => {
	return {
		socket,
		solver,
		plugs: actions.map(getPlug),
		salt: toHex(Math.floor(Date.now() / 1000), {
			size: 32
		})
	}
}

const plugs = getPlugs(zeroAddress, zeroAddress, intent)
plugs

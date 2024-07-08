import axios from "axios"

import {
	env,
	SimulationBundleRequest,
	SimulationData,
	SimulationRequest,
	SimulationResponse,
	TransactionSimulator
} from "@/src/lib"

export class Simulator implements TransactionSimulator {
	post = async (
		url: string,
		simulation: SimulationRequest | SimulationBundleRequest
	) => {
		const response = await axios.post(url, simulation, {
			headers: {
				"X-API-KEY": env.SIMULATOR_API_KEY,
				"Content-Type": "application/json"
			}
		})

		if (response.status !== 200) {
			throw new Error(
				`Invalid response with status ${
					response.status
				} - ${JSON.stringify(response)}`
			)
		}

		return response
	}

	simulate = async (simulation: SimulationRequest) => {
		const { data } = await this.post(
			`${env.SIMULATOR_URL}/api/v1/simulate`,
			simulation
		)
		return this.parse(data, false)
	}

	simulationBundle = async (simulationBundle: SimulationBundleRequest) => {
		const { data } = await this.post(
			`${env.SIMULATOR_URL}/api/v1/simulate-bundle`,
			simulationBundle
		)
		return data.map((simulation: SimulationResponse) =>
			this.parse(simulation, false)
		)
	}

	parse = (
		simulation: SimulationResponse,
		throwOnError = true
	): SimulationData => {
		if (throwOnError && simulation.success === false) {
			throw new Error("Simulation failed ${JSON.stringify(simulation)}")
		}

		const logs =
			simulation.logs?.map((log, index) => ({ ...log, index })) || []

		const delta = simulation.trace.reduce((accumulator, trace) => {
			const { to, from, value } = trace
			const amount = BigInt(value)

			if (amount > 0) {
				const toLower = to.toLowerCase()
				const fromLower = from.toLowerCase()

				accumulator.set(
					toLower,
					accumulator.get(toLower) ?? BigInt(0) + amount
				)
				accumulator.set(
					fromLower,
					accumulator.get(fromLower) ?? BigInt(0) - amount
				)
			}
			return accumulator
		}, new Map<string, bigint>())

		return {
			...simulation,
			logs,
			delta
		}
	}
}

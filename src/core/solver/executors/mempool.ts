import { TransactionRequest, Wallet } from "ethers"

import { Executor } from "@/src/core/solver/executors"

export type MempoolExecution = {
	transaction: TransactionRequest
	gasInfo?: {
		totalProfit: number
		bidPercentage?: number
	}
}

const key = "MempoolExecution" as const

export class MempoolExecutor<
	TExecution extends MempoolExecution = MempoolExecution
> extends Executor<typeof key, TExecution> {
	public static key = key

	constructor(public readonly signer: Wallet) {
		super(key)

		if (!this.signer.provider) throw new Error("Signer provider not set")
	}

	execute = async ({ transaction, gasInfo }: TExecution) => {
		// ! Estimate the gas consumption.
		const gasEstimate = await this.signer.estimateGas(transaction)

		let bidGasPrice = BigInt(0)
		if (gasInfo) {
			const breakEvenGasPrice =
				BigInt(gasInfo.totalProfit) / BigInt(gasEstimate.toString())

			// ! A portion of the potential profit is used for gas.
			bidGasPrice =
				(breakEvenGasPrice * BigInt(gasInfo.bidPercentage || 0)) /
				BigInt(100)
		} else {
			// ! Use the blocks current gas price if one was not provided.
			bidGasPrice = await this.signer
				// Provider is not-null because we checked for it in the constructor.
				.provider!.getFeeData()
				.then(feeData =>
					BigInt(feeData?.maxFeePerGas?.toString() || "0")
				)
		}

		transaction.gasPrice = bidGasPrice

		// ! Send the transaction.
		await this.signer.sendTransaction(transaction)
	}
}

import { BigNumber, PopulatedTransaction, Wallet } from "ethers"

import { Executor } from "@/src/core/solver/executors"

export type MempoolExecution = {
	transaction: PopulatedTransaction
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
	}

	execute = async ({ transaction, gasInfo }: TExecution) => {
		// ! Estimate the gas consumption.
		const gasEstimate = await this.signer.provider.estimateGas(transaction)

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
			bidGasPrice = await this.signer.provider
				.getFeeData()
				.then(feeData =>
					BigInt(feeData?.maxFeePerGas?.toString() || "0")
				)
		}

		transaction.gasPrice = BigNumber.from(bidGasPrice.toString())

		// ! Send the transaction.
		await this.signer.sendTransaction(transaction)
	}
}

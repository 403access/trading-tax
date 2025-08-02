import type { UnifiedTransaction, StakingReward } from "../core/types";
import { calculateStakingRewardValue } from "../core/price-data";
import { logger } from "../core/logger";

/**
 * Process staking reward transaction - this is taxable income in Germany
 */
export async function processStakingRewardTransaction(
	tx: UnifiedTransaction,
): Promise<{ stakingReward: StakingReward; eurValue: number }> {
	if (!tx.stakingData) {
		throw new Error("Staking reward transaction missing staking data");
	}

	const { asset, rewardAmount } = tx.stakingData;

	let eurValue: number;

	if (asset === "BTC") {
		// For BTC rewards, we can use the existing BTC price logic
		// For now, we'll use the BTC amount from the transaction
		eurValue = tx.eurAmount; // This should be calculated with historical BTC price
		if (eurValue === 0) {
			// If EUR amount not set, we need to calculate it with historical price
			// This would need integration with the existing price lookup service
			logger.warn(
				`⚠️  BTC staking reward EUR value not calculated: ${rewardAmount} BTC on ${tx.date}`,
			);
		}
	} else {
		// For non-BTC assets, calculate EUR value using price data
		eurValue = await calculateStakingRewardValue(
			asset,
			rewardAmount || 0,
			tx.date,
		);
	}

	const stakingReward: StakingReward = {
		date: tx.date,
		asset,
		amount: rewardAmount || 0,
		eurValue,
		source: tx.source,
	};

	logger.info(
		`🎁 Staking reward processed: ${stakingReward.amount} ${asset} = €${eurValue.toFixed(2)} on ${tx.date}`,
	);

	return { stakingReward, eurValue };
}

/**
 * Process staking allocation transaction - moving assets to/from staking
 * This affects the holding period (10 years instead of 1 year for staked assets)
 */
export function processStakingAllocationTransaction(tx: UnifiedTransaction): {
	isStaking: boolean;
	amount: number;
	asset: string;
} {
	if (!tx.stakingData) {
		throw new Error("Staking allocation transaction missing staking data");
	}

	const { asset, amount, isStaked } = tx.stakingData;

	logger.info(
		`🔄 Staking allocation: ${amount} ${asset} ${isStaked ? "staked" : "unstaked"} on ${tx.date}`,
	);

	return {
		isStaking: isStaked || false,
		amount,
		asset,
	};
}

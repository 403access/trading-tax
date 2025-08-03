import type { TaxResults } from "../../shared/types";
import { logger } from "../../shared/logger";
import { shouldTrackStakingIncome } from "../../tax-calculations/tax-config.js";

/**
 * Displays transaction statistics summary
 */
export function displayTransactionStats(results: TaxResults): void {
	logger.info("=== TRANSACTION STATISTICS ===");
	logger.info("Buys:", results.stats.buys);
	logger.info("Sells:", results.stats.sells);
	logger.info("Deposits:", results.stats.deposits);
	logger.info("Withdrawals:", results.stats.withdrawals);
	logger.info("Transfers:", results.stats.transfers);
	logger.info("Fee transactions:", results.stats.fees);

	if (shouldTrackStakingIncome()) {
		logger.info("Staking rewards:", results.stats.stakingRewards);
	}
}

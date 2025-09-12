import { logger } from "../shared/logger";
import type { TaxResults } from "../shared/types";
import { displayAssetTotals } from "./formatters/asset-totals";
import { displayOptimizationTips } from "./formatters/optimization-tips";
import { displayRemainingPurchases } from "./formatters/remaining-purchases";
import { displayStakingAnalysis } from "./formatters/staking-summary";
import { displayTaxAnalysis } from "./formatters/tax-analysis";
import { displayTradingOverview } from "./formatters/trading-summary";
import { displayTransactionStats } from "./formatters/transaction-stats";

/**
 * Main function to display comprehensive tax calculation results
 * Orchestrates all individual formatters in the correct order
 */
export function displayResults(results: TaxResults): void {
	logger.info("=== UNIFIED CRYPTO TAX CALCULATION ===");
	logger.info("");

	// Trading overview and basic calculations
	displayTradingOverview(results);

	// Detailed tax analysis
	displayTaxAnalysis(results);

	// Staking rewards analysis (if applicable)
	displayStakingAnalysis(results);

	// Tax optimization tips
	displayOptimizationTips(results);

	// Asset movements and totals
	displayAssetTotals(results);
	logger.info("");

	// Transaction statistics
	displayTransactionStats(results);
	logger.info("");

	// Remaining unsold purchases
	displayRemainingPurchases(results);
}

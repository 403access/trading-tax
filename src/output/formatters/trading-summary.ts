import type { TaxResults } from "../../core/types";
import { formatNumber } from "../../core/utils";
import { logger } from "../../core/logger";

/**
 * Displays trading overview including total bought/sold and year-based breakdown
 */
export function displayTradingOverview(results: TaxResults): void {
	logger.info("=== TRADING OVERVIEW ===");
	logger.info("Total Bought (EUR):", formatNumber(results.totalBuyEUR));
	logger.info("Total Sold (EUR):", formatNumber(results.totalSellEUR));
	logger.info(
		"Simple EUR-only Profit:",
		formatNumber(results.totalSellEUR - results.totalBuyEUR),
	);

	// Display year-based trading breakdown
	const years = Object.keys(results.tradingByYear).sort();
	if (years.length > 1) {
		logger.info("");
		logger.info("📊 Trading by Year:");
		for (const year of years) {
			const yearData = results.tradingByYear[year];
			if (!yearData) continue;

			const profit = yearData.sellEUR - yearData.buyEUR;
			logger.info(
				`   ${year}: Bought €${formatNumber(yearData.buyEUR)}, Sold €${formatNumber(yearData.sellEUR)}, Profit €${formatNumber(profit)}`,
			);
		}
	}

	logger.info("");
	logger.info(
		"💡 NOTE: Simple profit is negative because withdrawals are not valued in EUR.",
	);
	logger.info(
		"💡 Actual profit calculation below includes market-priced withdrawals!",
	);
}

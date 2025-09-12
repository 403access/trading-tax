import { logger } from "../../shared/logger";
import type { TaxResults } from "../../shared/types";
import { formatNumber } from "../../shared/utils";
import { formatAssetTotals } from "../utils/format-helpers";

/**
 * Displays comprehensive asset movement summary
 */
export function displayAssetTotals(results: TaxResults): void {
	logger.info("=== DEPOSIT & MOVEMENT SUMMARY ===");

	formatAssetTotals(results.totalDepositedAssets, "Total Deposited");
	logger.info(
		"Total Deposited (EUR):",
		formatNumber(results.totalDepositedEUR),
	);

	formatAssetTotals(results.totalWithdrawnAssets, "Total Withdrawn");
	logger.info(
		"Total Withdrawn (EUR):",
		formatNumber(results.totalWithdrawnEUR),
	);

	formatAssetTotals(results.totalTransferredAssets, "Total Transferred");
	formatAssetTotals(results.totalFeeAssets, "Total Fees");

	displayAssetNotes();
}

/**
 * Displays informational notes about asset tracking
 */
function displayAssetNotes(): void {
	logger.info(
		"ℹ️  Note: All cryptocurrency movements are tracked across BTC, ETH, SOL, and other assets.",
	);
	logger.info(
		"🔄 Transfers: Movements between exchanges are not taxable events.",
	);
}

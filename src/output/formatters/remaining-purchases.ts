import type { TaxResults, PurchaseEntry } from "../../core/types";
import { formatAsset, formatNumber } from "../../core/utils";
import { logger } from "../../core/logger";
import {
	groupByYear,
	formatDateWithoutYear,
	addYearSpacing,
} from "../utils/format-helpers";

/**
 * Displays remaining purchase queue (unsold holdings)
 */
export function displayRemainingPurchases(results: TaxResults): void {
	if (results.remainingPurchases.length === 0) {
		return;
	}

	logger.info("=== REMAINING PURCHASES (not yet sold) ===");

	const { purchasesByYear, remainingByAsset, totalRemainingEUR } =
		aggregateRemainingPurchases(results.remainingPurchases);

	displayPurchasesByYear(purchasesByYear);
	displayAssetSummary(remainingByAsset, totalRemainingEUR);
}

/**
 * Aggregates remaining purchases by year and asset
 */
function aggregateRemainingPurchases(remainingPurchases: PurchaseEntry[]) {
	const purchasesByYear = groupByYear(remainingPurchases);
	const remainingByAsset: Record<string, { amount: number; value: number }> =
		{};
	let totalRemainingEUR = 0;

	for (const purchase of remainingPurchases) {
		const asset = purchase.asset;
		const eurValue = purchase.remaining * purchase.pricePerAsset;

		if (!remainingByAsset[asset]) {
			remainingByAsset[asset] = { amount: 0, value: 0 };
		}
		remainingByAsset[asset].amount += purchase.remaining;
		remainingByAsset[asset].value += eurValue;
		totalRemainingEUR += eurValue;
	}

	return { purchasesByYear, remainingByAsset, totalRemainingEUR };
}

/**
 * Displays purchases grouped by year
 */
function displayPurchasesByYear(
	purchasesByYear: Record<string, PurchaseEntry[]>,
): void {
	const years = Object.keys(purchasesByYear).sort();

	for (let i = 0; i < years.length; i++) {
		const year = years[i];
		if (!year) continue;
		const yearPurchases = purchasesByYear[year];
		if (!yearPurchases) continue;

		const yearValue = yearPurchases.reduce(
			(sum: number, p: PurchaseEntry) => sum + p.remaining * p.pricePerAsset,
			0,
		);

		logger.info(
			`${year} (${yearPurchases.length} purchases, €${formatNumber(yearValue)} value):`,
		);

		for (const purchase of yearPurchases) {
			const date = formatDateWithoutYear(purchase.date);
			logger.info(
				`  ${date} (${purchase.source}): ${formatAsset(purchase.remaining, purchase.asset)} at ${formatNumber(purchase.pricePerAsset)} EUR/${purchase.asset}`,
			);
		}

		addYearSpacing(years, i);
	}
}

/**
 * Displays summary by asset type
 */
function displayAssetSummary(
	remainingByAsset: Record<string, { amount: number; value: number }>,
	totalRemainingEUR: number,
): void {
	logger.info("Summary by asset:");

	for (const [asset, data] of Object.entries(remainingByAsset)) {
		logger.info(
			`  ${formatAsset(data.amount, asset)} (Value: ${formatNumber(data.value)} EUR)`,
		);
	}

	logger.info(`Total remaining value: ${formatNumber(totalRemainingEUR)} EUR`);
}

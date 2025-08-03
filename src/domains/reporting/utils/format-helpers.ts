import { formatAsset } from "../../shared/utils";
import { logger } from "../../shared/logger";

/**
 * Helper function to format asset totals with consistent styling
 */
export function formatAssetTotals(
	assetTotals: Record<string, number>,
	label: string,
): void {
	logger.info(`${label}:`);
	const assets = Object.keys(assetTotals).sort();
	if (assets.length === 0) {
		logger.info("  (none)");
		return;
	}
	for (const asset of assets) {
		const amount = assetTotals[asset];
		logger.info(`  ${formatAsset(amount ?? 0, asset)}`);
	}
}

/**
 * Groups items by year from date strings
 */
export function groupByYear<T extends { date: string }>(
	items: T[],
): Record<string, T[]> {
	const itemsByYear: Record<string, T[]> = {};

	for (const item of items) {
		const year = new Date(item.date).getFullYear().toString();
		if (!itemsByYear[year]) {
			itemsByYear[year] = [];
		}
		itemsByYear[year].push(item);
	}

	return itemsByYear;
}

/**
 * Formats a date by removing the year prefix (YYYY-)
 */
export function formatDateWithoutYear(date: string): string {
	return date.slice(5); // Remove year prefix (YYYY-)
}

/**
 * Adds spacing between years when displaying multiple years
 */
export function addYearSpacing(years: string[], currentIndex: number): void {
	if (years.length > 1 && currentIndex < years.length - 1) {
		logger.info(""); // Add spacing between years
	}
}

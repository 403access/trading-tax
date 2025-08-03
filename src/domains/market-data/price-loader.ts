/**
 * Price data loading functionality
 */
import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { loadDataSources } from "../infrastructure";
import { logger } from "../shared/logger";
import { parseGermanDate, parseGermanNumber } from "./parsers";
import type {
	HistoricalPriceRow,
	PriceDataStats,
	YearRange,
	DataSourcesConfig,
} from "./types";

// Constants
const PRICE_DATA_START_YEAR = 2016;
const CSV_CONFIG = {
	delimiter: ",",
	columns: true,
	skip_empty_lines: true,
	trim: true,
} as const;

/**
 * Price data loader with caching
 */
export class PriceDataLoader {
	private priceCache: Map<string, number> | null = null;
	private stats: PriceDataStats | null = null;

	/**
	 * Load and cache historical price data
	 */
	public loadPriceData(): Map<string, number> {
		if (this.priceCache) {
			return this.priceCache;
		}

		this.priceCache = new Map();
		const dataSources = loadDataSources();
		const yearRange = this.calculateYearRange();

		const loadStats = {
			totalRecords: 0,
			successfulYears: [] as number[],
			failedYears: [] as number[],
		};

		// Load price data for each year
		for (let year = yearRange.start; year <= yearRange.end; year++) {
			const result = this.loadPriceDataForYear(year, dataSources);

			if (result.success) {
				loadStats.totalRecords += result.recordCount;
				loadStats.successfulYears.push(year);
			} else {
				loadStats.failedYears.push(year);
			}
		}

		this.logLoadingResults(loadStats);
		this.stats = this.createStatsFromLoadResult(loadStats);

		return this.priceCache;
	}

	/**
	 * Get statistics about loaded price data
	 */
	public getStats(): PriceDataStats | null {
		if (!this.stats) {
			this.loadPriceData(); // Ensure data is loaded
		}
		return this.stats;
	}

	/**
	 * Clear cache and force reload of price data
	 */
	public clearCache(): void {
		this.priceCache = null;
		this.stats = null;
	}

	/**
	 * Calculate the year range for loading price data
	 */
	private calculateYearRange(): YearRange {
		const currentYear = new Date().getFullYear();
		return {
			start: PRICE_DATA_START_YEAR,
			end: currentYear + 1,
		};
	}

	/**
	 * Load price data for a specific year
	 */
	private loadPriceDataForYear(
		year: number,
		dataSources: DataSourcesConfig,
	): { success: boolean; recordCount: number } {
		const priceKey = `btc-eur-${year}`;

		try {
			const pricePath = dataSources.historicalPrices[priceKey];
			if (!pricePath) {
				logger.log("priceData", `No price data configured for ${year}`);
				return { success: false, recordCount: 0 };
			}

			if (!fs.existsSync(pricePath)) {
				logger.log(
					"priceData",
					`Price data file not found for ${year}: ${pricePath}`,
				);
				return { success: false, recordCount: 0 };
			}

			const content = this.readAndCleanCsvFile(pricePath);
			const records = this.parseCsvContent(content);
			const recordCount = this.processPriceRecords(records);

			if (recordCount > 0) {
				logger.log(
					"priceData",
					`Loaded ${recordCount} price points from ${year}`,
				);
				return { success: true, recordCount };
			}

			return { success: false, recordCount: 0 };
		} catch (error) {
			logger.log(
				"priceData",
				`Could not load price data for ${year}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			return { success: false, recordCount: 0 };
		}
	}

	/**
	 * Read and clean CSV file content
	 */
	private readAndCleanCsvFile(filePath: string): string {
		const content = fs.readFileSync(filePath, "utf8");
		// Remove UTF-8 BOM if present
		return content.replace(/^\uFEFF/, "");
	}

	/**
	 * Parse CSV content into records
	 */
	private parseCsvContent(content: string): HistoricalPriceRow[] {
		return parse(content, CSV_CONFIG) as HistoricalPriceRow[];
	}

	/**
	 * Process price records and add to cache
	 */
	private processPriceRecords(records: HistoricalPriceRow[]): number {
		let recordCount = 0;

		for (const row of records) {
			const date = parseGermanDate(row.Datum);
			const price = parseGermanNumber(row.Zuletzt);

			if (date && price > 0 && this.priceCache) {
				this.priceCache.set(date, price);
				recordCount++;
			}
		}

		return recordCount;
	}

	/**
	 * Log the results of price data loading
	 */
	private logLoadingResults(stats: {
		totalRecords: number;
		successfulYears: number[];
		failedYears: number[];
	}): void {
		// Summary logging
		if (stats.successfulYears.length > 0) {
			const yearRange = this.formatYearRange(stats.successfulYears);
			logger.log(
				"priceData",
				`Loaded ${stats.totalRecords} historical price points from ${stats.successfulYears.length} years (${yearRange})`,
			);
		} else {
			logger.error("No historical price data could be loaded");
		}

		if (stats.failedYears.length > 0) {
			logger.log(
				"priceData",
				`Failed to load data for years: ${stats.failedYears.join(", ")}`,
			);
		}

		// Show date range of loaded data
		if (this.priceCache && this.priceCache.size > 0) {
			const dates = Array.from(this.priceCache.keys()).sort();
			logger.log(
				"priceData",
				`Price data range: ${dates[0]} to ${dates[dates.length - 1]}`,
			);
		}
	}

	/**
	 * Format year range for display
	 */
	private formatYearRange(years: number[]): string {
		return years.length === 1
			? String(years[0])
			: `${Math.min(...years)}-${Math.max(...years)}`;
	}

	/**
	 * Create stats object from load result
	 */
	private createStatsFromLoadResult(loadStats: {
		totalRecords: number;
		successfulYears: number[];
		failedYears: number[];
	}): PriceDataStats {
		let dateRange: { start: string; end: string } | null = null;

		if (this.priceCache && this.priceCache.size > 0) {
			const dates = Array.from(this.priceCache.keys()).sort();
			const firstDate = dates[0];
			const lastDate = dates[dates.length - 1];
			if (firstDate && lastDate) {
				dateRange = {
					start: firstDate,
					end: lastDate,
				};
			}
		}

		return {
			totalRecords: loadStats.totalRecords,
			successfulYears: loadStats.successfulYears,
			failedYears: loadStats.failedYears,
			dateRange,
		};
	}
}

// Create singleton instance
export const priceDataLoader = new PriceDataLoader();

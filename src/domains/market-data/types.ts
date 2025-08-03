/**
 * Types and interfaces for market data functionality
 */

// Interface for historical price data CSV rows
export interface HistoricalPriceRow {
	Datum: string;
	Zuletzt: string;
	[key: string]: string;
}

// Price interpolation result with metadata
export interface PriceInterpolationResult {
	price: number;
	source: "exact" | "interpolated" | "previous" | "next";
	sourceDate?: string;
	daysDifference?: number;
}

// Nearest prices for interpolation
export interface NearestPrices {
	previous: { time: number; price: number } | null;
	next: { time: number; price: number } | null;
}

// Price data loading statistics
export interface PriceDataStats {
	totalRecords: number;
	successfulYears: number[];
	failedYears: number[];
	dateRange: {
		start: string;
		end: string;
	} | null;
}

// Year range configuration
export interface YearRange {
	start: number;
	end: number;
}

// Data sources configuration
export interface DataSourcesConfig {
	historicalPrices: Record<string, string>;
}

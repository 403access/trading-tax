import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { formatNumber } from "../core/utils";
import { loadDataSources } from "../config";
import { logger, LogLevel } from "../core/logger";

// Interface for historical price data
interface HistoricalPriceRow {
	Datum: string;
	Zuletzt: string;
	[key: string]: string;
}

// Cache for price data
let priceCache: Map<string, number> | null = null;

// Load and parse historical price data
function loadPriceData(): Map<string, number> {
	if (priceCache) {
		return priceCache;
	}

	priceCache = new Map();

	// Load data sources configuration
	const dataSources = loadDataSources();

	// Load 2016 data
	try {
		const path2016 = dataSources.historicalPrices["btc-eur-2016"];
		if (!path2016) {
			throw new Error("2016 price data path not configured");
		}
		const content2016 = fs.readFileSync(path2016, "utf8");
		// Remove UTF-8 BOM if present
		const cleanContent2016 = content2016.replace(/^\uFEFF/, "");

		const records2016 = parse(cleanContent2016, {
			delimiter: ",",
			columns: true,
			skip_empty_lines: true,
			trim: true,
		}) as HistoricalPriceRow[];

		for (const row of records2016) {
			const date = parseGermanDate(row.Datum);
			const price = parseGermanNumber(row.Zuletzt);
			if (date && price > 0) {
				priceCache.set(date, price);
			}
		}
		logger.logWithLevel("priceData", LogLevel.DEBUG, `Loaded ${records2016.length} price points from 2016`);
	} catch {
		logger.logWithLevel("priceData", LogLevel.WARN, "Warning: Could not load 2016 price data");
	}

	// Load 2017 data
	try {
		const path2017 = dataSources.historicalPrices["btc-eur-2017"];
		if (!path2017) {
			throw new Error("2017 price data path not configured");
		}
		const content2017 = fs.readFileSync(path2017, "utf8");
		// Remove UTF-8 BOM if present
		const cleanContent2017 = content2017.replace(/^\uFEFF/, "");

		const records2017 = parse(cleanContent2017, {
			delimiter: ",",
			columns: true,
			skip_empty_lines: true,
			trim: true,
		}) as HistoricalPriceRow[];

		for (const row of records2017) {
			const date = parseGermanDate(row.Datum);
			const price = parseGermanNumber(row.Zuletzt);
			if (date && price > 0) {
				priceCache.set(date, price);
			}
		}
		logger.logWithLevel("priceData", LogLevel.DEBUG, `Loaded ${records2017.length} price points from 2017`);
	} catch {
		logger.logWithLevel("priceData", LogLevel.WARN, "Warning: Could not load 2017 price data");
	}

	logger.log("priceData", `Loaded ${priceCache.size} historical price points`);

	// Debug: Show date range of loaded data
	if (priceCache.size > 0) {
		const dates = Array.from(priceCache.keys()).sort();
		logger.logWithLevel("priceData", LogLevel.DEBUG, `Price data range: ${dates[0]} to ${dates[dates.length - 1]}`);
	}

	return priceCache;
}

// Parse German date format (DD.MM.YYYY)
function parseGermanDate(dateStr: string): string | null {
	try {
		// Remove quotes if present
		const cleanDate = dateStr.replace(/"/g, "");
		const [day, month, year] = cleanDate.split(".");
		if (day && month && year) {
			return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
		}
	} catch {
		// Ignore parsing errors
	}
	return null;
}

// Parse German number format (comma as decimal separator)
function parseGermanNumber(numStr: string): number {
	try {
		// Remove quotes first
		let cleanStr = numStr.replace(/"/g, "");

		// Remove any K suffix and handle thousands
		const hasKSuffix = cleanStr.includes("K");
		cleanStr = cleanStr.replace("K", "");

		// For German format: replace thousands separators (.) and decimal comma (,)
		cleanStr = cleanStr
			.replace(/\./g, "") // Remove thousands separator
			.replace(",", "."); // Replace decimal comma with dot

		const num = parseFloat(cleanStr);

		// If original had K suffix, multiply by 1000
		if (hasKSuffix) {
			return num * 1000;
		}

		return num;
	} catch {
		return 0;
	}
}

// Get Bitcoin price for a specific date
export function getBitcoinPrice(date: string): number | null {
	const prices = loadPriceData();

	// First try exact date match
	const exactDate = date.split(" ")[0]; // Remove time part
	if (exactDate && prices.has(exactDate)) {
		return prices.get(exactDate) || null;
	}

	if (!exactDate) {
		return null;
	}

	const targetDate = new Date(exactDate);
	const targetTime = targetDate.getTime();

	// Find the closest previous and next prices
	let previousPrice: number | null = null;
	let nextPrice: number | null = null;
	let previousTime = -Infinity;
	let nextTime = Infinity;

	for (const [priceDate, price] of prices) {
		const priceDateObj = new Date(priceDate);
		const priceTime = priceDateObj.getTime();

		if (priceTime < targetTime) {
			// This is a previous date
			if (priceTime > previousTime) {
				previousTime = priceTime;
				previousPrice = price;
			}
		} else if (priceTime > targetTime) {
			// This is a future date
			if (priceTime < nextTime) {
				nextTime = priceTime;
				nextPrice = price;
			}
		}
	}

	// Return interpolated price or fallback
	if (previousPrice !== null && nextPrice !== null) {
		// Use average of previous and next prices
		const interpolatedPrice = (previousPrice + nextPrice) / 2;
		const prevDateStr = new Date(previousTime).toISOString().split("T")[0];
		const nextDateStr = new Date(nextTime).toISOString().split("T")[0];
		console.log(
			`📊 Using interpolated price for ${exactDate}: €${formatNumber(interpolatedPrice)}/BTC (avg of €${formatNumber(previousPrice)} on ${prevDateStr} and €${formatNumber(nextPrice)} on ${nextDateStr})`,
		);
		return interpolatedPrice;
	} else if (previousPrice !== null) {
		// Only previous price available
		const prevDateStr = new Date(previousTime).toISOString().split("T")[0];
		const daysDiff = Math.round(
			(targetTime - previousTime) / (1000 * 60 * 60 * 24),
		);
		console.log(
			`📊 Using previous price for ${exactDate}: €${formatNumber(previousPrice)}/BTC (from ${prevDateStr}, ${daysDiff} days ago)`,
		);
		return previousPrice;
	} else if (nextPrice !== null) {
		// Only next price available
		const nextDateStr = new Date(nextTime).toISOString().split("T")[0];
		const daysDiff = Math.round(
			(nextTime - targetTime) / (1000 * 60 * 60 * 24),
		);
		console.log(
			`📊 Using next price for ${exactDate}: €${formatNumber(nextPrice)}/BTC (from ${nextDateStr}, ${daysDiff} days later)`,
		);
		return nextPrice;
	}

	// No price data available
	return null;
}

// Get price with fallback to last known price
export function getBitcoinPriceWithFallback(
	date: string,
	fallbackPrice: number,
): number {
	const marketPrice = getBitcoinPrice(date);
	return marketPrice || fallbackPrice;
}

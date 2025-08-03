/**
 * Bitcoin price lookup functionality
 * Main public API for getting Bitcoin prices with intelligent fallback and interpolation
 */
import { extractDateFromString } from "./parsers";
import { priceDataLoader } from "./price-loader";
import { priceInterpolator } from "./price-interpolator";
import type { PriceDataStats } from "./types";

/**
 * Bitcoin Price Lookup Service
 * Handles price retrieval with intelligent fallback and interpolation
 */
class BitcoinPriceLookup {
	/**
	 * Get Bitcoin price for a specific date with intelligent fallback
	 * @param date - Date string (can include time, will be extracted)
	 * @returns Price in EUR or null if not available
	 */
	public getPrice(date: string): number | null {
		const prices = priceDataLoader.loadPriceData();
		const exactDate = extractDateFromString(date);

		if (!exactDate) {
			return null;
		}

		// Try exact match first
		if (prices.has(exactDate)) {
			return prices.get(exactDate) || null;
		}

		// Use interpolation for missing dates
		return priceInterpolator.interpolatePrice(exactDate, prices);
	}

	/**
	 * Get price with fallback to provided fallback price
	 * @param date - Date string
	 * @param fallbackPrice - Price to use if market price not available
	 * @returns Market price or fallback price
	 */
	public getPriceWithFallback(date: string, fallbackPrice: number): number {
		return this.getPrice(date) || fallbackPrice;
	}

	/**
	 * Get statistics about loaded price data
	 * @returns Statistics about the loaded price data
	 */
	public getStats(): PriceDataStats | null {
		return priceDataLoader.getStats();
	}

	/**
	 * Clear cache and force reload of price data
	 */
	public clearCache(): void {
		priceDataLoader.clearCache();
	}
}

// Create singleton instance
const bitcoinPriceLookup = new BitcoinPriceLookup();

/**
 * Get Bitcoin price for a specific date
 * @param date - Date string (can include time, will be extracted)
 * @returns Price in EUR or null if not available
 */
export function getBitcoinPrice(date: string): number | null {
	return bitcoinPriceLookup.getPrice(date);
}

/**
 * Get Bitcoin price with fallback to provided fallback price
 * @param date - Date string
 * @param fallbackPrice - Price to use if market price not available
 * @returns Market price or fallback price
 */
export function getBitcoinPriceWithFallback(
	date: string,
	fallbackPrice: number,
): number {
	return bitcoinPriceLookup.getPriceWithFallback(date, fallbackPrice);
}

// Export the class and instance for advanced usage
export { BitcoinPriceLookup, bitcoinPriceLookup };

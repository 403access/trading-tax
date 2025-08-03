/**
 * Price interpolation functionality for missing dates
 */
import { formatNumber } from "../shared/utils";
import { logger } from "../shared/logger";
import type { NearestPrices } from "./types";

// Constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Price interpolator for calculating prices on missing dates
 */
export class PriceInterpolator {
	/**
	 * Interpolate price for a date not in the dataset
	 */
	public interpolatePrice(
		exactDate: string,
		prices: Map<string, number>,
	): number | null {
		const targetDate = new Date(exactDate);
		const targetTime = targetDate.getTime();

		const nearestPrices = this.findNearestPrices(targetTime, prices);

		if (!nearestPrices.previous && !nearestPrices.next) {
			return null;
		}

		return this.calculateInterpolatedPrice(
			exactDate,
			targetTime,
			nearestPrices,
		);
	}

	/**
	 * Find the nearest previous and next prices for interpolation
	 */
	private findNearestPrices(
		targetTime: number,
		prices: Map<string, number>,
	): NearestPrices {
		let previous: { time: number; price: number } | null = null;
		let next: { time: number; price: number } | null = null;

		for (const [priceDate, price] of prices) {
			const priceTime = new Date(priceDate).getTime();

			if (priceTime < targetTime) {
				if (!previous || priceTime > previous.time) {
					previous = { time: priceTime, price };
				}
			} else if (priceTime > targetTime) {
				if (!next || priceTime < next.time) {
					next = { time: priceTime, price };
				}
			}
		}

		return { previous, next };
	}

	/**
	 * Calculate interpolated price and log the result
	 */
	private calculateInterpolatedPrice(
		exactDate: string,
		targetTime: number,
		nearestPrices: NearestPrices,
	): number {
		const { previous, next } = nearestPrices;

		if (previous && next) {
			// Interpolate between previous and next prices
			const interpolatedPrice = (previous.price + next.price) / 2;
			const prevDateStr = new Date(previous.time).toISOString().split("T")[0];
			const nextDateStr = new Date(next.time).toISOString().split("T")[0];

			logger.log(
				"priceData",
				`📊 Using interpolated price for ${exactDate}: €${formatNumber(interpolatedPrice)}/BTC (avg of €${formatNumber(previous.price)} on ${prevDateStr} and €${formatNumber(next.price)} on ${nextDateStr})`,
			);

			return interpolatedPrice;
		}

		if (previous) {
			// Use previous price
			const prevDateStr = new Date(previous.time).toISOString().split("T")[0];
			const daysDiff = Math.round(
				(targetTime - previous.time) / MILLISECONDS_PER_DAY,
			);

			logger.log(
				"priceData",
				`📊 Using previous price for ${exactDate}: €${formatNumber(previous.price)}/BTC (from ${prevDateStr}, ${daysDiff} days ago)`,
			);

			return previous.price;
		}

		if (next) {
			// Use next price
			const nextDateStr = new Date(next.time).toISOString().split("T")[0];
			const daysDiff = Math.round(
				(next.time - targetTime) / MILLISECONDS_PER_DAY,
			);

			logger.log(
				"priceData",
				`📊 Using next price for ${exactDate}: €${formatNumber(next.price)}/BTC (from ${nextDateStr}, ${daysDiff} days later)`,
			);

			return next.price;
		}

		return 0; // This should never happen due to the check above
	}
}

// Create singleton instance
export const priceInterpolator = new PriceInterpolator();

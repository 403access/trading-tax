import { logger } from "./logger";

// Cache for price data to avoid repeated API calls
const priceCache = new Map<string, number>();

/**
 * Get historical EUR price for an asset at a specific date
 * For now, this is a simplified implementation that would need real price data
 */
export async function getHistoricalPrice(
	asset: string,
	date: string,
): Promise<number> {
	const cacheKey = `${asset}-${date}`;

	if (priceCache.has(cacheKey)) {
		const cachedPrice = priceCache.get(cacheKey);
		if (cachedPrice !== undefined) {
			return cachedPrice;
		}
	}

	// For demonstration, provide some example prices
	// In a real implementation, this would fetch from a price API
	const examplePrices: Record<string, number> = {
		SOL: 150, // Example: SOL at ~€150
		ETH: 2800, // Example: ETH at ~€2800
		ADA: 0.45, // Example: ADA at ~€0.45
		DOT: 6.5, // Example: DOT at ~€6.5
	};

	const price = examplePrices[asset] || 0;

	if (price === 0) {
		logger.warn(`⚠️  No price data available for ${asset} on ${date}, using €0`);
	} else {
		logger.info(`💰 Historical price for ${asset} on ${date}: €${price}`);
	}

	priceCache.set(cacheKey, price);
	return price;
}

/**
 * Calculate EUR value of a staking reward
 */
export async function calculateStakingRewardValue(
	asset: string,
	amount: number,
	date: string,
): Promise<number> {
	if (asset === "EUR") {
		return amount; // Already in EUR
	}

	const price = await getHistoricalPrice(asset, date);
	const eurValue = amount * price;

	logger.info(
		`🧮 Staking reward value: ${amount} ${asset} = €${eurValue.toFixed(2)} (price: €${price})`,
	);

	return eurValue;
}

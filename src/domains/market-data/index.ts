// Market Data Domain Barrel Export
// Price lookup and historical data

export {
	extractDateFromString,
	parseGermanDate,
	parseGermanNumber,
} from "./parsers";

export { calculateStakingRewardValue, getHistoricalPrice } from "./price-data";
export { PriceInterpolator, priceInterpolator } from "./price-interpolator";

// Individual modules (for advanced usage)
export { PriceDataLoader, priceDataLoader } from "./price-loader";

// Main services
export {
	BitcoinPriceLookup,
	bitcoinPriceLookup,
	getBitcoinPrice,
	getBitcoinPriceWithFallback,
} from "./price-lookup";

// Types
export type {
	DataSourcesConfig,
	HistoricalPriceRow,
	NearestPrices,
	PriceDataStats,
	PriceInterpolationResult,
	YearRange,
} from "./types";

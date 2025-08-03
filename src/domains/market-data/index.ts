// Market Data Domain Barrel Export
// Price lookup and historical data

// Main services
export {
	getBitcoinPrice,
	getBitcoinPriceWithFallback,
	BitcoinPriceLookup,
	bitcoinPriceLookup,
} from "./price-lookup";
export { getHistoricalPrice, calculateStakingRewardValue } from "./price-data";

// Individual modules (for advanced usage)
export { priceDataLoader, PriceDataLoader } from "./price-loader";
export { priceInterpolator, PriceInterpolator } from "./price-interpolator";
export {
	parseGermanDate,
	parseGermanNumber,
	extractDateFromString,
} from "./parsers";

// Types
export type {
	HistoricalPriceRow,
	PriceDataStats,
	PriceInterpolationResult,
	NearestPrices,
	YearRange,
	DataSourcesConfig,
} from "./types";

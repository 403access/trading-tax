// Reporting Domain Barrel Export
// Simplified imports for external consumers

// Main reporting functionality
export { displayResults } from "./main-formatter";

// Individual formatters (for advanced usage)
export {
	displayTradingOverview,
	displayTaxAnalysis,
	displayStakingAnalysis,
	displayAssetTotals,
	displayTransactionStats,
	displayRemainingPurchases,
	displayOptimizationTips,
} from "./formatters";

// Utilities
export {
	formatAssetTotals,
	groupByYear,
	formatDateWithoutYear,
	addYearSpacing,
} from "./utils/format-helpers";

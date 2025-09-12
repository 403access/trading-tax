// Reporting Domain Barrel Export
// Simplified imports for external consumers

// Individual formatters (for advanced usage)
export {
	displayAssetTotals,
	displayOptimizationTips,
	displayRemainingPurchases,
	displayStakingAnalysis,
	displayTaxAnalysis,
	displayTradingOverview,
	displayTransactionStats,
} from "./formatters";

// Main reporting functionality
export { displayResults } from "./main-formatter";

// Utilities
export {
	addYearSpacing,
	formatAssetTotals,
	formatDateWithoutYear,
	groupByYear,
} from "./utils/format-helpers";

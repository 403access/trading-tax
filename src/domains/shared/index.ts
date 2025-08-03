// Shared Domain Barrel Export
// Core types and utilities used across all domains

// Primary types
export type {
	UnifiedTransaction,
	TaxResults,
	PurchaseEntry,
	StakingData,
} from "./types";

// Logger
export { logger } from "./logger";

// Utilities
export {
	toNumber,
	formatNumber,
	formatCrypto,
	formatBTC,
	formatAsset,
	getAssetDecimals,
	isHeldOverOneYear,
} from "./utils";

// Constants
export const DEFAULT_CURRENCY = "EUR";
export const SUPPORTED_ASSETS = ["BTC", "ETH"] as const;

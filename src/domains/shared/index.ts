// Shared Domain Barrel Export
// Core types and utilities used across all domains

// Logger
export { logger } from "./logger";

// Primary types
export type {
	LogRecord,
	PurchaseEntry,
	RunOutput,
	StakingData,
	TaxResults,
	UnifiedTransaction,
} from "./types";

// Utilities
export {
	formatAsset,
	formatBTC,
	formatCrypto,
	formatNumber,
	getAssetDecimals,
	isHeldOverOneYear,
	toNumber,
} from "./utils";

// Constants
export const DEFAULT_CURRENCY = "EUR";
export const SUPPORTED_ASSETS = ["BTC", "ETH"] as const;

// Logger helpers for buffered logs
export {
	disableLogBuffer,
	enableLogBuffer,
	flushLogBuffer,
} from "./logger";

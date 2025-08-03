// Domain Architecture Index
// Central export point for all business domains

// Shared domain - common types, utilities, and services
export * from "./shared";

// Infrastructure domain - configuration and system concerns
export type { DataSourcesConfig } from "./infrastructure";
export { loadDataSources } from "./infrastructure";

// Data Integration domain - parsing and importing data
export * from "./data-integration";

// Transaction Processing domain - handling different transaction types
export * from "./transaction-processing";

// Tax Calculations domain - FIFO logic and German tax law
export * from "./tax-calculations";

// Market Data domain - historical prices and market data
export * from "./market-data";

// Reporting domain - formatting and displaying results
export * from "./reporting";

import type { TaxResults } from "./shared/types";

// Domain-level orchestration
export interface CryptoTaxApplication {
	loadData(): Promise<void>;
	processTransactions(): Promise<TaxResults>;
	generateReport(): void;
}

// Re-export main types for convenience
export type {
	UnifiedTransaction,
	TaxResults,
	PurchaseEntry,
	StakingReward,
} from "./shared/types";

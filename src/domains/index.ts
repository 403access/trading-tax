// Domain Architecture Index
// Central export point for all business domains

// Data Integration domain - parsing and importing data
export * from "./data-integration";

// Infrastructure domain - configuration and system concerns
export type { DataSourcesConfig } from "./infrastructure";
export { loadDataSources } from "./infrastructure";

// Market Data domain - historical prices and market data
export * from "./market-data";

// Reporting domain - formatting and displaying results
export * from "./reporting";

// Shared domain - common types, utilities, and services
export * from "./shared";

// Tax Calculations domain - FIFO logic and German tax law
export * from "./tax-calculations";

// Transaction Processing domain - handling different transaction types
export * from "./transaction-processing";

import type { TaxResults } from "./shared/types";

// Domain-level orchestration
export interface CryptoTaxApplication {
	loadData(): Promise<void>;
	processTransactions(): Promise<TaxResults>;
	generateReport(): void;
}

// Re-export main types for convenience
export type {
	PurchaseEntry,
	StakingReward,
	TaxResults,
	UnifiedTransaction,
} from "./shared/types";

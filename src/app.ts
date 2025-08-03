// Domain-based imports using barrel exports
import { processTransactions } from "./domains/tax-calculations";
import type { UnifiedTransaction } from "./domains/shared";
import { displayResults } from "./domains/reporting";
import {
	loadTransactions,
	parseBitcoinDe,
	parseKraken,
} from "./domains/data-integration";
import { loadDataSources } from "./domains/infrastructure";
import { logger } from "./domains/shared";

export async function runApplication(): Promise<void> {
	logger.info("🔄 Loading configuration...");
	const dataSources = loadDataSources();

	logger.log("dataLoading", "📊 Loading transaction data...");
	const bitcoinDeConfig = dataSources.transactions["bitcoin-de"];
	const krakenConfig = dataSources.transactions.kraken;

	const bitcoinLedgers = bitcoinDeConfig?.["full"];
	const krakenLedgers = krakenConfig?.["ledgers-full"];

	if (!bitcoinLedgers || !krakenLedgers) {
		logger.error("❌ Required transaction files not configured");
		return;
	}

	const allTransactions: UnifiedTransaction[] = [
		...loadTransactions(parseBitcoinDe, bitcoinLedgers, "Bitcoin.de"),
		...loadTransactions(parseKraken, krakenLedgers, "Kraken"),
	];

	if (allTransactions.length === 0) {
		logger.error("❌ No transactions found.");
		return;
	}

	logger.log("dataLoading", `✅ Loaded ${allTransactions.length} transactions`);
	logger.log("taxCalculations", "🧮 Calculating tax implications...");

	const results = await processTransactions(allTransactions);

	logger.log("results", "📋 Generating report...");
	displayResults(results);

	logger.info("✨ Tax calculation complete!");
}

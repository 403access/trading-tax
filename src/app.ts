import { processTransactions, type UnifiedTransaction } from "./core/index";
import { displayResults } from "./output/index";
import { parseBitcoinDe } from "./parsers/bitcoin-de";
import { parseKraken } from "./parsers/kraken";
import { loadTransactions } from "./transactions/load-transactions";
import { loadDataSources } from "./config";
import { logger, LogLevel } from "./core/logger";

export function runApplication(): void {
	logger.info("🔄 Loading configuration...");
	const dataSources = loadDataSources();

	logger.log("dataLoading", "📊 Loading transaction data...");
	const bitcoinDeConfig = dataSources.transactions["bitcoin-de"];
	const krakenConfig = dataSources.transactions.kraken;

	if (!bitcoinDeConfig?.full || !krakenConfig?.["ledgers-2017"]) {
		logger.error("❌ Required transaction files not configured");
		return;
	}

	const allTransactions: UnifiedTransaction[] = [
		...loadTransactions(parseBitcoinDe, bitcoinDeConfig.full, "Bitcoin.de"),
		...loadTransactions(parseKraken, krakenConfig["ledgers-2017"], "Kraken"),
	];

	if (allTransactions.length === 0) {
		logger.error("❌ No transactions found.");
		return;
	}

	logger.log("dataLoading", `✅ Loaded ${allTransactions.length} transactions`);
	logger.log("taxCalculations", "🧮 Calculating tax implications...");

	const results = processTransactions(allTransactions);

	logger.log("results", "📋 Generating report...");
	displayResults(results);

	logger.info("✨ Tax calculation complete!");
}

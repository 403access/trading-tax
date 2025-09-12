import {
	loadTransactions,
	parseBitcoinDe,
	parseKraken,
} from "./domains/data-integration";
import { loadDataSources } from "./domains/infrastructure";
import { displayResults } from "./domains/reporting";
import type { RunOutput, UnifiedTransaction } from "./domains/shared";
import { enableLogBuffer, flushLogBuffer, logger } from "./domains/shared";
import { processTransactions } from "./domains/tax-calculations";

export async function runApplication(): Promise<RunOutput> {
	enableLogBuffer();
	try {
		logger.info("🔄 Loading configuration...");
		const dataSources = loadDataSources();

		logger.log("dataLoading", "📊 Loading transaction data...");
		const bitcoinDeConfig = dataSources.transactions["bitcoin-de"];
		const krakenConfig = dataSources.transactions.kraken;

		const bitcoinLedgers = bitcoinDeConfig?.["full"];
		const krakenLedgers = krakenConfig?.["ledgers-full"];

		if (!bitcoinLedgers || !krakenLedgers) {
			logger.error("❌ Required transaction files not configured");
			const logs = flushLogBuffer();
			return { logs, error: "Missing transaction files in config" };
		}

		const allTransactions: UnifiedTransaction[] = [
			...loadTransactions(parseBitcoinDe, bitcoinLedgers, "Bitcoin.de"),
			...loadTransactions(parseKraken, krakenLedgers, "Kraken"),
		];

		if (allTransactions.length === 0) {
			logger.error("❌ No transactions found.");
			const logs = flushLogBuffer();
			return { logs, error: "No transactions found" };
		}

		logger.log(
			"dataLoading",
			`✅ Loaded ${allTransactions.length} transactions`,
		);
		logger.log("taxCalculations", "🧮 Calculating tax implications...");

		const results = await processTransactions(allTransactions);

		logger.log("results", "📋 Generating report...");
		// Keep displayResults for CLI readability while still returning data
		displayResults(results);

		logger.info("✨ Tax calculation complete!");
		const logs = flushLogBuffer();
		return { results, logs };
	} catch (e) {
		logger.error("❌ Application error", e);
		const logs = flushLogBuffer();
		return { logs, error: e instanceof Error ? e.message : String(e) };
	}
}

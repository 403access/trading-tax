import { processTransactions, type UnifiedTransaction } from "./core/index";
import { displayResults } from "./output/index";
import { parseBitcoinDe } from "./parsers/bitcoin-de";
import { parseKraken } from "./parsers/kraken";
import { loadTransactions } from "./transactions/load-transactions";
import { loadDataSources } from "./config";

export function runApplication(): void {
	console.log("🔄 Loading configuration...");
	const dataSources = loadDataSources();

	console.log("📊 Loading transaction data...");
	const bitcoinDeConfig = dataSources.transactions["bitcoin-de"];
	const krakenConfig = dataSources.transactions.kraken;

	if (!bitcoinDeConfig?.full || !krakenConfig?.["ledgers-2017"]) {
		console.error("❌ Required transaction files not configured");
		return;
	}

	const allTransactions: UnifiedTransaction[] = [
		...loadTransactions(parseBitcoinDe, bitcoinDeConfig.full, "Bitcoin.de"),
		...loadTransactions(parseKraken, krakenConfig["ledgers-2017"], "Kraken"),
	];

	if (allTransactions.length === 0) {
		console.log("❌ No transactions found.");
		return;
	}

	console.log(`✅ Loaded ${allTransactions.length} transactions`);
	console.log("🧮 Calculating tax implications...");

	const results = processTransactions(allTransactions);

	console.log("📋 Generating report...");
	displayResults(results);

	console.log("✨ Tax calculation complete!");
}

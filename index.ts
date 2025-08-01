import { exit } from "node:process";
import type { UnifiedTransaction } from "./src/types.js";
import { parseBitcoinDe } from "./src/parsers/bitcoin-de.js";
import { parseKraken } from "./src/parsers/kraken.js";
import { processTransactions } from "./src/tax-calculator.js";
import { displayResults } from "./src/output.js";
import { loadTransactions } from "./src/transactions/load-transactions.js";

// Main execution
function main() {
	const allTransactions: UnifiedTransaction[] = [
		...loadTransactions(
			parseBitcoinDe,
			"bitcoin-de-transactions.csv",
			"Bitcoin.de",
		),
		...loadTransactions(parseKraken, "kraken-ledgers-2017.csv", "Kraken"),
	];

	if (allTransactions.length === 0) {
		console.log("No transaction files found!");
		exit(1);
	}

	console.log(`\nProcessing ${allTransactions.length} total transactions...\n`);

	// Process transactions and display results
	displayResults(processTransactions(allTransactions));
}

main();

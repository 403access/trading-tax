import { exit } from "node:process";
import type { UnifiedTransaction } from "./src/types.js";
import { parseBitcoinDe } from "./src/parsers/bitcoin-de.js";
import { parseKraken } from "./src/parsers/kraken.js";
import { processTransactions } from "./src/tax-calculator.js";
import { displayResults } from "./src/output.js";

// Main execution
function main() {
	const allTransactions: UnifiedTransaction[] = [];

	// Process Bitcoin.de file if it exists
	try {
		const bitcoinDeTransactions = parseBitcoinDe("bitcoin-de-transactions.csv");
		allTransactions.push(...bitcoinDeTransactions);
		console.log(
			`Loaded ${bitcoinDeTransactions.length} transactions from Bitcoin.de`,
		);
	} catch {
		console.log("No Bitcoin.de file found or error reading it");
	}

	// Process Kraken file if it exists
	try {
		const krakenTransactions = parseKraken("kraken-ledgers-2017.csv");
		allTransactions.push(...krakenTransactions);
		console.log(`Loaded ${krakenTransactions.length} transactions from Kraken`);
	} catch {
		console.log("No Kraken file found or error reading it");
	}

	if (allTransactions.length === 0) {
		console.log("No transaction files found!");
		exit(1);
	}

	console.log(`\nProcessing ${allTransactions.length} total transactions...\n`);

	// Process transactions and calculate taxes
	const results = processTransactions(allTransactions);

	// Display results
	displayResults(results);
}

main();

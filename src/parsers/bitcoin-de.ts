import fs from "node:fs";
import { parse } from "csv-parse/sync";
import type { BitcoinDeRow, UnifiedTransaction } from "../types.js";
import { toNumber } from "../utils.js";

// Read and parse Bitcoin.de CSV file
export function readBitcoinDeCsv(filePath: string): BitcoinDeRow[] {
	const content = fs.readFileSync(filePath, "utf8");
	return parse(content, {
		delimiter: ";",
		columns: true,
		skip_empty_lines: true,
		trim: true,
	}) as BitcoinDeRow[];
}

// Parse Bitcoin.de CSV records into unified transactions
export function parseBitcoinDeRecords(
	records: BitcoinDeRow[],
): UnifiedTransaction[] {
	const transactions: UnifiedTransaction[] = [];

	// Helper function to create transaction object
	const createTransaction = (
		date: string,
		type: UnifiedTransaction["type"],
		btcAmount: number,
		eurAmount: number,
		row: BitcoinDeRow,
	): UnifiedTransaction => ({
		date,
		type,
		btcAmount,
		eurAmount,
		source: "bitcoin.de",
		originalData: row,
	});

	for (const row of records) {
		const typ = row["Typ"];
		const mengeNachGebuehr = toNumber(row["Menge nach Bitcoin.de-Gebühr"]);
		const btcNachGebuehr = toNumber(row["BTC nach Bitcoin.de-Gebühr"]);
		const zuAbgang = toNumber(row["Zu- / Abgang"]);
		const datum = row["Datum"];

		if (typ === "Kauf") {
			transactions.push(
				createTransaction(datum, "buy", btcNachGebuehr, -mengeNachGebuehr, row),
			);
		} else if (typ === "Verkauf") {
			transactions.push(
				createTransaction(datum, "sell", btcNachGebuehr, mengeNachGebuehr, row),
			);
		} else if (typ === "Einzahlung") {
			transactions.push(createTransaction(datum, "deposit", zuAbgang, 0, row));
		} else if (typ === "Auszahlung") {
			transactions.push(
				createTransaction(datum, "withdrawal", zuAbgang, 0, row),
			);
		} else if (typ === "Netzwerk-Gebühr") {
			transactions.push(createTransaction(datum, "fee", zuAbgang, 0, row));
		}
	}

	return transactions;
}

// Convenience function that combines file reading and parsing
export function parseBitcoinDe(filePath: string): UnifiedTransaction[] {
	const records = readBitcoinDeCsv(filePath);
	return parseBitcoinDeRecords(records);
}

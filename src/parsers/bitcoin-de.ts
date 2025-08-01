import fs from "node:fs";
import { parse } from "csv-parse/sync";
import type { BitcoinDeRow, UnifiedTransaction } from "../types.js";
import { toNumber } from "../utils.js";

// Parse Bitcoin.de CSV
export function parseBitcoinDe(filePath: string): UnifiedTransaction[] {
	const content = fs.readFileSync(filePath, "utf8");
	const records = parse(content, {
		delimiter: ";",
		columns: true,
		skip_empty_lines: true,
		trim: true,
	}) as BitcoinDeRow[];

	const transactions: UnifiedTransaction[] = [];

	for (const row of records) {
		const typ = row["Typ"];
		const mengeNachGebuehr = toNumber(row["Menge nach Bitcoin.de-Gebühr"]);
		const btcNachGebuehr = toNumber(row["BTC nach Bitcoin.de-Gebühr"]);
		const zuAbgang = toNumber(row["Zu- / Abgang"]);
		const datum = row["Datum"];

		if (typ === "Kauf") {
			transactions.push({
				date: datum,
				type: "buy",
				btcAmount: btcNachGebuehr,
				eurAmount: -mengeNachGebuehr, // negative because we spent EUR
				source: "bitcoin.de",
				originalData: row,
			});
		} else if (typ === "Verkauf") {
			transactions.push({
				date: datum,
				type: "sell",
				btcAmount: btcNachGebuehr, // negative in source data
				eurAmount: mengeNachGebuehr, // positive because we received EUR
				source: "bitcoin.de",
				originalData: row,
			});
		} else if (typ === "Einzahlung") {
			transactions.push({
				date: datum,
				type: "deposit",
				btcAmount: zuAbgang,
				eurAmount: 0,
				source: "bitcoin.de",
				originalData: row,
			});
		} else if (typ === "Auszahlung") {
			transactions.push({
				date: datum,
				type: "withdrawal",
				btcAmount: zuAbgang, // negative in source data
				eurAmount: 0,
				source: "bitcoin.de",
				originalData: row,
			});
		} else if (typ === "Netzwerk-Gebühr") {
			transactions.push({
				date: datum,
				type: "fee",
				btcAmount: zuAbgang, // negative in source data
				eurAmount: 0,
				source: "bitcoin.de",
				originalData: row,
			});
		}
	}

	return transactions;
}

import fs from "node:fs";
import { parse } from "csv-parse/sync";
import type { KrakenRow, UnifiedTransaction } from "../core/types";
import { toNumber } from "../core/utils";

// Read and parse Kraken CSV file
export function readKrakenCsv(filePath: string): KrakenRow[] {
	const content = fs.readFileSync(filePath, "utf8");
	return parse(content, {
		delimiter: ",",
		columns: true,
		skip_empty_lines: true,
		trim: true,
	}) as KrakenRow[];
}

// Parse Kraken CSV records into unified transactions
export function parseKrakenRecords(records: KrakenRow[]): UnifiedTransaction[] {
	const transactions: UnifiedTransaction[] = [];
	const tradeGroups = new Map<string, KrakenRow[]>();

	// Helper function to create transaction object
	const createTransaction = (
		date: string,
		type: UnifiedTransaction["type"],
		btcAmount: number,
		eurAmount: number,
		originalData: KrakenRow | { btcRow: KrakenRow; eurRow: KrakenRow },
	): UnifiedTransaction => ({
		date,
		type,
		btcAmount,
		eurAmount,
		source: "kraken",
		originalData,
	});

	// Group trades by refid (Kraken splits each trade into separate BTC and EUR entries)
	for (const row of records) {
		if (row.type === "trade") {
			if (!tradeGroups.has(row.refid)) {
				tradeGroups.set(row.refid, []);
			}
			tradeGroups.get(row.refid)?.push(row);
		} else {
			// Handle non-trade transactions directly
			const amount = toNumber(row.amount);
			const fee = toNumber(row.fee);

			if (row.type === "deposit") {
				if (row.asset === "BTC") {
					transactions.push(
						createTransaction(row.time, "deposit", amount, 0, row),
					);
				} else if (row.asset === "EUR") {
					transactions.push(
						createTransaction(row.time, "deposit", 0, amount, row),
					);
				} else {
					console.warn(
						`Ignoring deposit of unsupported asset: ${row.asset} at ${row.time}`,
					);
				}
			} else if (row.type === "withdrawal") {
				if (row.asset === "BTC") {
					transactions.push(
						createTransaction(row.time, "withdrawal", amount, 0, row),
					);

					// Also add withdrawal fee as separate transaction
					if (fee > 0) {
						transactions.push(createTransaction(row.time, "fee", -fee, 0, row));
					}
				}
			}
		}
	}

	// Process trade groups
	for (const tradeRows of tradeGroups.values()) {
		const btcRow = tradeRows.find((r) => r.asset === "BTC");
		const eurRow = tradeRows.find((r) => r.asset === "EUR");

		if (btcRow && eurRow) {
			const btcAmount = toNumber(btcRow.amount);
			const eurAmount = toNumber(eurRow.amount);
			const btcFee = toNumber(btcRow.fee);
			const eurFee = toNumber(eurRow.fee);

			// Determine if it's a buy or sell based on BTC amount direction
			const isBuy = btcAmount > 0;

			transactions.push(
				createTransaction(
					btcRow.time,
					isBuy ? "buy" : "sell",
					btcAmount,
					eurAmount,
					{ btcRow, eurRow },
				),
			);

			// Add fees as separate transactions
			if (btcFee > 0) {
				transactions.push(
					createTransaction(btcRow.time, "fee", -btcFee, 0, btcRow),
				);
			}
			if (eurFee > 0) {
				transactions.push(
					createTransaction(eurRow.time, "fee", 0, -eurFee, eurRow),
				);
			}
		}
	}

	return transactions;
}

// Convenience function that combines file reading and parsing
export function parseKraken(filePath: string): UnifiedTransaction[] {
	const records = readKrakenCsv(filePath);
	return parseKrakenRecords(records);
}

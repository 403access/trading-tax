import fs from "node:fs";
import { parse } from "csv-parse/sync";
import type { KrakenRow, UnifiedTransaction } from "../types.js";
import { toNumber } from "../utils.js";

// Parse Kraken CSV
export function parseKraken(filePath: string): UnifiedTransaction[] {
	const content = fs.readFileSync(filePath, "utf8");
	const records = parse(content, {
		delimiter: ",",
		columns: true,
		skip_empty_lines: true,
		trim: true,
	}) as KrakenRow[];

	const transactions: UnifiedTransaction[] = [];
	const tradeGroups = new Map<string, KrakenRow[]>();

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
					transactions.push({
						date: row.time,
						type: "deposit",
						btcAmount: amount,
						eurAmount: 0,
						source: "kraken",
						originalData: row,
					});
				}
				// EUR deposits don't affect crypto tax calculation
			} else if (row.type === "withdrawal") {
				if (row.asset === "BTC") {
					transactions.push({
						date: row.time,
						type: "withdrawal",
						btcAmount: amount, // already negative in Kraken data
						eurAmount: 0,
						source: "kraken",
						originalData: row,
					});

					// Also add withdrawal fee as separate transaction
					if (fee > 0) {
						transactions.push({
							date: row.time,
							type: "fee",
							btcAmount: -fee,
							eurAmount: 0,
							source: "kraken",
							originalData: row,
						});
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

			transactions.push({
				date: btcRow.time,
				type: isBuy ? "buy" : "sell",
				btcAmount: btcAmount,
				eurAmount: eurAmount,
				source: "kraken",
				originalData: { btcRow, eurRow },
			});

			// Add fees as separate transactions
			if (btcFee > 0) {
				transactions.push({
					date: btcRow.time,
					type: "fee",
					btcAmount: -btcFee,
					eurAmount: 0,
					source: "kraken",
					originalData: btcRow,
				});
			}
			if (eurFee > 0) {
				transactions.push({
					date: eurRow.time,
					type: "fee",
					btcAmount: 0,
					eurAmount: -eurFee,
					source: "kraken",
					originalData: eurRow,
				});
			}
		}
	}

	return transactions;
}

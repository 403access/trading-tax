import fs from "node:fs";
import { parse } from "csv-parse/sync";
import type { KrakenRow, UnifiedTransaction } from "../shared/types";
import { toNumber } from "../shared/utils";

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
		asset: string,
		assetAmount: number,
		eurAmount: number,
		originalData: KrakenRow | { assetRow: KrakenRow; eurRow: KrakenRow },
	): UnifiedTransaction => ({
		date,
		type,
		asset,
		assetAmount,
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
				if (row.asset !== "EUR") {
					// For crypto deposits (BTC, ETH, SOL, etc.)
					transactions.push(
						createTransaction(row.time, "deposit", row.asset, amount, 0, row),
					);
				} else {
					// For EUR deposits
					transactions.push(
						createTransaction(row.time, "deposit", "EUR", 0, amount, row),
					);
				}
			} else if (row.type === "withdrawal") {
				if (row.asset !== "EUR") {
					// For crypto withdrawals
					transactions.push(
						createTransaction(
							row.time,
							"withdrawal",
							row.asset,
							amount,
							0,
							row,
						),
					);

					// Also add withdrawal fee as separate transaction
					if (fee > 0) {
						transactions.push(
							createTransaction(row.time, "fee", row.asset, -fee, 0, row),
						);
					}
				}
			} else if (row.type === "earn") {
				// Handle staking transactions
				if (row.subtype === "reward") {
					// Staking reward received - this is taxable income
					console.log(
						`🎁 Staking reward: ${amount} ${row.asset} received on ${row.time}`,
					);

					const stakingTransaction = createTransaction(
						row.time,
						"staking_reward",
						row.asset,
						amount, // Asset amount
						0, // EUR value to be calculated later with market data
						row,
					);

					stakingTransaction.stakingData = {
						asset: row.asset,
						amount: amount,
						rewardAmount: amount,
						isStaked: true,
					};

					transactions.push(stakingTransaction);
				} else if (row.subtype === "allocation") {
					// Staking allocation - moving assets to/from staking
					console.log(
						`🔄 Staking allocation: ${amount} ${row.asset} allocation on ${row.time}`,
					);

					const stakingTransaction = createTransaction(
						row.time,
						"staking_allocation",
						row.asset,
						amount, // Asset amount (can be negative for unstaking)
						0,
						row,
					);

					stakingTransaction.stakingData = {
						asset: row.asset,
						amount: Math.abs(amount), // Amount being staked/unstaked
						isStaked: amount > 0, // Positive means staking, negative means unstaking
					};

					transactions.push(stakingTransaction);
				}
			}
		}
	}

	// Process trade groups
	for (const tradeRows of tradeGroups.values()) {
		// Find the crypto asset row (BTC, ETH, SOL, etc.) and EUR row
		const eurRow = tradeRows.find((r) => r.asset === "EUR");
		const assetRow = tradeRows.find((r) => r.asset !== "EUR");

		if (assetRow && eurRow) {
			const assetAmount = toNumber(assetRow.amount);
			const eurAmount = toNumber(eurRow.amount);
			const assetFee = toNumber(assetRow.fee);
			const eurFee = toNumber(eurRow.fee);

			// Determine if it's a buy or sell based on asset amount direction
			const isBuy = assetAmount > 0;

			transactions.push(
				createTransaction(
					assetRow.time,
					isBuy ? "buy" : "sell",
					assetRow.asset,
					assetAmount,
					eurAmount,
					{ assetRow, eurRow },
				),
			);

			// Add fees as separate transactions
			if (assetFee > 0) {
				transactions.push(
					createTransaction(
						assetRow.time,
						"fee",
						assetRow.asset,
						-assetFee,
						0,
						assetRow,
					),
				);
			}
			if (eurFee > 0) {
				transactions.push(
					createTransaction(eurRow.time, "fee", "EUR", 0, -eurFee, eurRow),
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

/** biome-ignore-all lint/complexity/useLiteralKeys: Easier to read */

import fs from "node:fs";
import { exit } from "node:process";
import { parse } from "csv-parse/sync";

// Unified transaction type
interface UnifiedTransaction {
	date: string;
	type: "buy" | "sell" | "deposit" | "withdrawal" | "fee";
	btcAmount: number; // positive for incoming, negative for outgoing
	eurAmount: number; // positive for incoming, negative for outgoing
	source: "bitcoin.de" | "kraken";
	originalData: unknown;
}

// Type definitions for different exchange formats
type BitcoinDeRow = {
	Datum: string;
	Typ: string;
	Währung: string;
	Referenz: string;
	"BTC-Adresse": string;
	Kurs: string;
	"Einheit (Kurs)": string;
	"BTC vor Gebühr": string;
	"Menge vor Gebühr": string;
	"Einheit (Menge vor Gebühr)": string;
	"BTC nach Bitcoin.de-Gebühr": string;
	"Menge nach Bitcoin.de-Gebühr": string;
	"Einheit (Menge nach Bitcoin.de-Gebühr)": string;
	"Zu- / Abgang": string;
	Kontostand: string;
};

type KrakenRow = {
	txid: string;
	refid: string;
	time: string;
	type: string;
	subtype: string;
	aclass: string;
	asset: string;
	wallet: string;
	amount: string;
	fee: string;
	balance: string;
};

function toNumber(value: string): number {
	const num = parseFloat(value.replace(",", "."));
	return Number.isNaN(num) ? 0 : num;
}

function formatNumber(num: number): string {
	const str = num.toFixed(2);
	const [integerPart, decimalPart] = str.split(".");
	const formattedInteger = (integerPart || "0").replace(
		/\B(?=(\d{3})+(?!\d))/g,
		" ",
	);
	return `${formattedInteger}.${decimalPart || "00"}`;
}

function formatBTC(num: number): string {
	const str = num.toFixed(8);
	const [integerPart, decimalPart] = str.split(".");
	const formattedInteger = (integerPart || "0").replace(
		/\B(?=(\d{3})+(?!\d))/g,
		" ",
	);
	return `${formattedInteger}.${decimalPart || "00000000"}`;
}

// Parse Bitcoin.de CSV
function parseBitcoinDe(filePath: string): UnifiedTransaction[] {
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

// Parse Kraken CSV
function parseKraken(filePath: string): UnifiedTransaction[] {
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

// Main processing function
function processTransactions(transactions: UnifiedTransaction[]) {
	// Sort all transactions by date
	transactions.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	// FIFO queue for purchases
	interface PurchaseEntry {
		amount: number; // BTC amount
		pricePerBTC: number; // EUR per BTC
		date: string;
		remaining: number; // remaining BTC amount
		source: string;
	}

	const purchaseQueue: PurchaseEntry[] = [];
	let totalTaxableGain = 0;
	let totalBuyEUR = 0;
	let totalSellEUR = 0;
	let totalWithdrawnBTC = 0;
	let totalFeeBTC = 0;

	// Stats
	let buys = 0,
		sells = 0,
		deposits = 0,
		withdrawals = 0,
		fees = 0;

	for (const tx of transactions) {
		if (tx.type === "buy") {
			const eurAmount = Math.abs(tx.eurAmount);
			const btcAmount = tx.btcAmount;
			const pricePerBTC = btcAmount > 0 ? eurAmount / btcAmount : 0;

			totalBuyEUR += eurAmount;

			// Add to FIFO queue
			if (btcAmount > 0) {
				purchaseQueue.push({
					amount: btcAmount,
					pricePerBTC: pricePerBTC,
					date: tx.date,
					remaining: btcAmount,
					source: tx.source,
				});
			}
			buys++;
		} else if (tx.type === "sell") {
			const eurAmount = tx.eurAmount;
			const btcAmount = Math.abs(tx.btcAmount);

			totalSellEUR += eurAmount;

			// Calculate taxable gain using FIFO
			let remainingSaleAmount = btcAmount;
			let saleGain = 0;

			while (remainingSaleAmount > 0 && purchaseQueue.length > 0) {
				const oldestPurchase = purchaseQueue[0];
				if (!oldestPurchase) break;

				if (oldestPurchase.remaining <= remainingSaleAmount) {
					// Use entire remaining amount from this purchase
					const costBasis =
						oldestPurchase.remaining * oldestPurchase.pricePerBTC;
					const saleValue = (oldestPurchase.remaining / btcAmount) * eurAmount;
					saleGain += saleValue - costBasis;

					remainingSaleAmount -= oldestPurchase.remaining;
					purchaseQueue.shift();
				} else {
					// Partially use this purchase
					const costBasis = remainingSaleAmount * oldestPurchase.pricePerBTC;
					const saleValue = (remainingSaleAmount / btcAmount) * eurAmount;
					saleGain += saleValue - costBasis;

					oldestPurchase.remaining -= remainingSaleAmount;
					remainingSaleAmount = 0;
				}
			}

			totalTaxableGain += saleGain;
			sells++;
		} else if (tx.type === "withdrawal") {
			const btcAmount = Math.abs(tx.btcAmount);
			totalWithdrawnBTC += btcAmount;

			// For tax purposes, withdrawals are treated as disposals
			// We need to estimate market value at withdrawal time
			let estimatedMarketRate = 0;
			if (purchaseQueue.length > 0) {
				// Use the most recent purchase price as approximation
				estimatedMarketRate =
					purchaseQueue[purchaseQueue.length - 1]?.pricePerBTC || 0;
			}

			if (btcAmount > 0) {
				let remainingWithdrawalAmount = btcAmount;
				let withdrawalGain = 0;

				while (remainingWithdrawalAmount > 0 && purchaseQueue.length > 0) {
					const oldestPurchase = purchaseQueue[0];
					if (!oldestPurchase) break;

					if (oldestPurchase.remaining <= remainingWithdrawalAmount) {
						const costBasis =
							oldestPurchase.remaining * oldestPurchase.pricePerBTC;
						const estimatedValue =
							oldestPurchase.remaining * estimatedMarketRate;
						withdrawalGain += estimatedValue - costBasis;

						remainingWithdrawalAmount -= oldestPurchase.remaining;
						purchaseQueue.shift();
					} else {
						const costBasis =
							remainingWithdrawalAmount * oldestPurchase.pricePerBTC;
						const estimatedValue =
							remainingWithdrawalAmount * estimatedMarketRate;
						withdrawalGain += estimatedValue - costBasis;

						oldestPurchase.remaining -= remainingWithdrawalAmount;
						remainingWithdrawalAmount = 0;
					}
				}

				totalTaxableGain += withdrawalGain;
				// console.log(
				// 	`⚠️  Withdrawal (${tx.source}) on ${tx.date}: ${formatBTC(btcAmount)} BTC (est. gain: ${formatNumber(withdrawalGain)} EUR)`,
				// );
			}
			withdrawals++;
		} else if (tx.type === "deposit") {
			deposits++;
		} else if (tx.type === "fee") {
			if (tx.btcAmount < 0) {
				totalFeeBTC += Math.abs(tx.btcAmount);
			}
			fees++;
		}
	}

	// Output results
	console.log("=== UNIFIED CRYPTO TAX CALCULATION ===");
	console.log("");
	console.log("=== TRADING OVERVIEW ===");
	console.log("Total Bought (EUR):", formatNumber(totalBuyEUR));
	console.log("Total Sold (EUR):", formatNumber(totalSellEUR));
	console.log("Simple Profit (EUR):", formatNumber(totalSellEUR - totalBuyEUR));
	console.log("");
	console.log("=== TAX RELEVANT (FIFO Method) ===");
	console.log("Taxable Gain (EUR):", formatNumber(totalTaxableGain));
	console.log("⚠️  IMPORTANT: Withdrawals are treated as disposals!");
	console.log(
		"⚠️  Market prices at withdrawals are estimated (last purchase price)!",
	);
	console.log("⚠️  Use actual market prices for accurate tax calculation!");
	console.log("");
	console.log("=== BITCOIN MOVEMENTS ===");
	console.log("Total Withdrawn (BTC):", formatBTC(totalWithdrawnBTC));
	console.log("Total Fees (BTC):", formatBTC(totalFeeBTC));
	console.log("");
	console.log("=== TRANSACTION STATISTICS ===");
	console.log("Buys:", buys);
	console.log("Sells:", sells);
	console.log("Deposits:", deposits);
	console.log("Withdrawals:", withdrawals);
	console.log("Fee transactions:", fees);
	console.log("");

	// Show remaining purchase queue
	if (purchaseQueue.length > 0) {
		console.log("=== REMAINING PURCHASES (not yet sold) ===");
		let totalRemainingBTC = 0;
		let totalRemainingEUR = 0;
		for (const purchase of purchaseQueue) {
			totalRemainingBTC += purchase.remaining;
			totalRemainingEUR += purchase.remaining * purchase.pricePerBTC;
			console.log(
				`${purchase.date} (${purchase.source}): ${formatBTC(purchase.remaining)} BTC at ${formatNumber(purchase.pricePerBTC)} EUR/BTC`,
			);
		}
		console.log(
			`Total remaining: ${formatBTC(totalRemainingBTC)} BTC (Value: ${formatNumber(totalRemainingEUR)} EUR)`,
		);
	}
}

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
	processTransactions(allTransactions);
}

main();

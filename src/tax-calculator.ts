import type { PurchaseEntry, TaxResults, UnifiedTransaction } from "./types.js";
import { processBuyTransaction } from "./buy-handler.js";
import { processSellTransaction } from "./sell-handler.js";
import { processWithdrawalTransaction } from "./withdrawal-handler.js";
import { processDepositTransaction } from "./deposit-handler.js";
import { processFeeTransaction } from "./fee-handler.js";

// Main tax processing function
export function processTransactions(
	transactions: UnifiedTransaction[],
): TaxResults {
	// Sort all transactions by date
	transactions.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	const purchaseQueue: PurchaseEntry[] = [];
	let totalTaxableGain = 0;
	let totalExemptGain = 0; // Gains from assets held > 1 year (tax-free)
	let totalBuyEUR = 0;
	let totalSellEUR = 0;
	let totalWithdrawnBTC = 0;
	let totalDepositedBTC = 0;
	let totalDepositedEUR = 0;
	let totalFeeBTC = 0;

	// Stats
	let buys = 0,
		sells = 0,
		deposits = 0,
		withdrawals = 0,
		fees = 0;

	for (const tx of transactions) {
		if (tx.type === "buy") {
			const eurAmount = processBuyTransaction(tx, purchaseQueue);
			totalBuyEUR += eurAmount;
			buys++;
		} else if (tx.type === "sell") {
			const result = processSellTransaction(tx, purchaseQueue);
			totalSellEUR += result.eurAmount;
			totalTaxableGain += result.taxableGain;
			totalExemptGain += result.exemptGain;
			sells++;
		} else if (tx.type === "withdrawal") {
			const result = processWithdrawalTransaction(tx, purchaseQueue);
			totalWithdrawnBTC += result.btcAmount;
			totalTaxableGain += result.taxableGain;
			totalExemptGain += result.exemptGain;
			withdrawals++;
		} else if (tx.type === "deposit") {
			const result = processDepositTransaction(tx);
			totalDepositedBTC += result.depositedBTC;
			totalDepositedEUR += result.depositedEUR;
			deposits++;
		} else if (tx.type === "fee") {
			const feeBTC = processFeeTransaction(tx);
			totalFeeBTC += feeBTC;
			fees++;
		}
	}

	return {
		totalTaxableGain,
		totalExemptGain,
		totalBuyEUR,
		totalSellEUR,
		totalWithdrawnBTC,
		totalDepositedBTC,
		totalDepositedEUR,
		totalFeeBTC,
		stats: {
			buys,
			sells,
			deposits,
			withdrawals,
			fees,
		},
		remainingPurchases: purchaseQueue,
	};
}

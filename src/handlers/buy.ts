import type { PurchaseEntry, UnifiedTransaction } from "../core/types";

export function processBuyTransaction(
	tx: UnifiedTransaction,
	purchaseQueue: PurchaseEntry[],
): number {
	const eurAmount = Math.abs(tx.eurAmount);
	const btcAmount = tx.btcAmount;
	const pricePerBTC = btcAmount > 0 ? eurAmount / btcAmount : 0;

	// Add to FIFO queue (purchases are processed in chronological order due to pre-sorting)
	// This ensures the oldest purchases are used first when calculating disposal gains
	if (btcAmount > 0) {
		purchaseQueue.push({
			amount: btcAmount,
			pricePerBTC: pricePerBTC,
			date: tx.date,
			remaining: btcAmount,
			source: tx.source,
		});
	}

	return eurAmount;
}

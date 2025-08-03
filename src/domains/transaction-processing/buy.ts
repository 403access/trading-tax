import type { PurchaseEntry, UnifiedTransaction } from "../shared/types";

export function processBuyTransaction(
	tx: UnifiedTransaction,
	purchaseQueue: PurchaseEntry[],
): number {
	const eurAmount = Math.abs(tx.eurAmount);
	const assetAmount = tx.assetAmount;
	const pricePerAsset = assetAmount > 0 ? eurAmount / assetAmount : 0;

	// Add to FIFO queue (purchases are processed in chronological order due to pre-sorting)
	// This ensures the oldest purchases are used first when calculating disposal gains
	if (assetAmount > 0) {
		purchaseQueue.push({
			amount: assetAmount,
			pricePerAsset: pricePerAsset,
			asset: tx.asset,
			date: tx.date,
			remaining: assetAmount,
			source: tx.source,
		});
	}

	return eurAmount;
}

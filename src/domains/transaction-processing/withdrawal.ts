import type { PurchaseEntry, UnifiedTransaction } from "../shared/types";
import { getBitcoinPrice } from "../market-data/price-lookup";

export interface WithdrawalResult {
	eurValue: number;
	taxableGain: number;
	exemptGain: number;
}

export function processWithdrawalTransaction(
	tx: UnifiedTransaction,
	purchaseQueue: PurchaseEntry[],
): WithdrawalResult {
	const assetAmount = Math.abs(tx.assetAmount);

	// For now, only handle Bitcoin withdrawals properly
	// Other assets will return 0 EUR value until proper price lookup is implemented
	if (tx.asset !== "BTC") {
		return {
			eurValue: 0,
			taxableGain: 0,
			exemptGain: 0,
		};
	}

	// Get historical Bitcoin price for this withdrawal date
	const historicalPrice = getBitcoinPrice(tx.date);

	// For tax purposes, withdrawals are treated as disposals
	let estimatedMarketRate = 0;
	if (historicalPrice !== null) {
		estimatedMarketRate = historicalPrice;
	} else if (purchaseQueue.length > 0) {
		// Use most recent purchase price as fallback estimate
		const relevantPurchases = purchaseQueue.filter((p) => p.asset === tx.asset);
		estimatedMarketRate =
			relevantPurchases.length > 0
				? relevantPurchases[relevantPurchases.length - 1]?.pricePerAsset || 0
				: 0;
	}

	// TODO: Implement FIFO withdrawal logic for asset-agnostic handling
	// For now, just return basic EUR value calculation

	return {
		eurValue: assetAmount * estimatedMarketRate,
		taxableGain: 0, // TODO: Implement proper FIFO gain calculation
		exemptGain: 0, // TODO: Implement proper FIFO gain calculation
	};
}

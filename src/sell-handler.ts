import type { PurchaseEntry, UnifiedTransaction } from "./types.js";
import { formatBTC, formatNumber, isHeldOverOneYear } from "./utils.js";

export interface SellResult {
	eurAmount: number;
	taxableGain: number;
	exemptGain: number;
}

export function processSellTransaction(
	tx: UnifiedTransaction,
	purchaseQueue: PurchaseEntry[],
): SellResult {
	const eurAmount = tx.eurAmount;
	const btcAmount = Math.abs(tx.btcAmount);

	// Calculate taxable gain using FIFO with one-year exemption
	let remainingSaleAmount = btcAmount;
	let saleGain = 0;
	let exemptGain = 0;

	while (remainingSaleAmount > 0 && purchaseQueue.length > 0) {
		const oldestPurchase = purchaseQueue[0];
		if (!oldestPurchase) break;

		const isExempt = isHeldOverOneYear(oldestPurchase.date, tx.date);

		if (oldestPurchase.remaining <= remainingSaleAmount) {
			// Use entire remaining amount from this purchase
			const costBasis = oldestPurchase.remaining * oldestPurchase.pricePerBTC;
			const saleValue = (oldestPurchase.remaining / btcAmount) * eurAmount;
			const gain = saleValue - costBasis;

			if (isExempt) {
				exemptGain += gain;
			} else {
				saleGain += gain;
			}

			remainingSaleAmount -= oldestPurchase.remaining;
			purchaseQueue.shift();
		} else {
			// Partially use this purchase
			const costBasis = remainingSaleAmount * oldestPurchase.pricePerBTC;
			const saleValue = (remainingSaleAmount / btcAmount) * eurAmount;
			const gain = saleValue - costBasis;

			if (isExempt) {
				exemptGain += gain;
			} else {
				saleGain += gain;
			}

			oldestPurchase.remaining -= remainingSaleAmount;
			remainingSaleAmount = 0;
		}
	}

	if (exemptGain > 0) {
		console.log(
			`💰 Sale on ${tx.date}: ${formatBTC(btcAmount)} BTC - Taxable: ${formatNumber(saleGain)} EUR, Tax-free (>1yr): ${formatNumber(exemptGain)} EUR`,
		);
	}

	return {
		eurAmount,
		taxableGain: saleGain,
		exemptGain,
	};
}

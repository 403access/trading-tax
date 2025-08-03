import type { PurchaseEntry, UnifiedTransaction } from "../core/types";
import {
	formatBTC,
	formatNumber,
	isHeldOverOneYear,
	getHoldingPeriodDetails,
} from "../core/utils";

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
	const assetAmount = Math.abs(tx.assetAmount);

	// Only process sales for the same asset type
	const relevantPurchases = purchaseQueue.filter((p) => p.asset === tx.asset);

	// Calculate taxable gain using FIFO with one-year exemption
	// Process oldest purchases first (purchaseQueue[0]) per German tax law requirements
	let remainingSaleAmount = assetAmount;
	let saleGain = 0;
	let exemptGain = 0;

	let purchaseIndex = 0;
	while (remainingSaleAmount > 0 && purchaseIndex < purchaseQueue.length) {
		const currentPurchase = purchaseQueue[purchaseIndex];
		if (!currentPurchase || currentPurchase.asset !== tx.asset) {
			purchaseIndex++;
			continue;
		}

		const isExempt = isHeldOverOneYear(currentPurchase.date, tx.date);

		if (currentPurchase.remaining <= remainingSaleAmount) {
			// Use entire remaining amount from this purchase
			const costBasis =
				currentPurchase.remaining * currentPurchase.pricePerAsset;
			const saleValue = (currentPurchase.remaining / assetAmount) * eurAmount;
			const gain = saleValue - costBasis;

			if (isExempt) {
				exemptGain += gain;
			} else {
				saleGain += gain;
			}

			remainingSaleAmount -= currentPurchase.remaining;
			// Remove this purchase from queue since it's fully consumed
			purchaseQueue.splice(purchaseIndex, 1);
		} else {
			// Partially use this purchase
			const costBasis = remainingSaleAmount * currentPurchase.pricePerAsset;
			const saleValue = (remainingSaleAmount / assetAmount) * eurAmount;
			const gain = saleValue - costBasis;

			if (isExempt) {
				exemptGain += gain;
			} else {
				saleGain += gain;
			}

			currentPurchase.remaining -= remainingSaleAmount;
			remainingSaleAmount = 0;
		}
	}

	if (exemptGain > 0 || saleGain > 0) {
		// Enhanced logging with holding period details
		const oldestUsedPurchase =
			purchaseQueue.length > 0 ? purchaseQueue[0] : null;
		let holdingInfo = "";

		if (oldestUsedPurchase) {
			const holdingDetails = getHoldingPeriodDetails(
				oldestUsedPurchase.date,
				tx.date,
			);
			holdingInfo = ` (${holdingDetails.status})`;
		}

		console.log(
			`💰 Sale on ${tx.date}: ${assetAmount.toFixed(8)} ${tx.asset}${holdingInfo} - Taxable: ${formatNumber(saleGain)} EUR, Tax-free (>1yr): ${formatNumber(exemptGain)} EUR`,
		);
	}

	return {
		eurAmount,
		taxableGain: saleGain,
		exemptGain,
	};
}

import type { PurchaseEntry, UnifiedTransaction } from "./types.js";
import { formatBTC, formatNumber, isHeldOverOneYear } from "./utils.js";
import { getBitcoinPrice } from "./price-lookup.js";

export interface WithdrawalResult {
	btcAmount: number;
	eurValue: number;
	taxableGain: number;
	exemptGain: number;
}

export function processWithdrawalTransaction(
	tx: UnifiedTransaction,
	purchaseQueue: PurchaseEntry[],
): WithdrawalResult {
	const btcAmount = Math.abs(tx.btcAmount);

	// Get historical Bitcoin price for this withdrawal date
	const historicalPrice = getBitcoinPrice(tx.date);

	// For tax purposes, withdrawals are treated as disposals
	let estimatedMarketRate = 0;
	if (historicalPrice !== null) {
		estimatedMarketRate = historicalPrice;
	} else if (purchaseQueue.length > 0) {
		// Fallback to most recent purchase price
		estimatedMarketRate =
			purchaseQueue[purchaseQueue.length - 1]?.pricePerBTC || 0;
		console.log(
			`⚠️  No historical price found for ${tx.date}, using last purchase price: €${formatNumber(estimatedMarketRate)}/BTC`,
		);
	} else {
		console.log(`❌ No price data available for withdrawal on ${tx.date}`);
	}

	let withdrawalGain = 0;
	let exemptWithdrawalGain = 0;

	if (btcAmount > 0) {
		let remainingWithdrawalAmount = btcAmount;

		while (remainingWithdrawalAmount > 0 && purchaseQueue.length > 0) {
			const oldestPurchase = purchaseQueue[0];
			if (!oldestPurchase) break;

			const isExempt = isHeldOverOneYear(oldestPurchase.date, tx.date);

			if (oldestPurchase.remaining <= remainingWithdrawalAmount) {
				const costBasis = oldestPurchase.remaining * oldestPurchase.pricePerBTC;
				const estimatedValue = oldestPurchase.remaining * estimatedMarketRate;
				const gain = estimatedValue - costBasis;

				if (isExempt) {
					exemptWithdrawalGain += gain;
				} else {
					withdrawalGain += gain;
				}

				remainingWithdrawalAmount -= oldestPurchase.remaining;
				purchaseQueue.shift();
			} else {
				const costBasis =
					remainingWithdrawalAmount * oldestPurchase.pricePerBTC;
				const estimatedValue = remainingWithdrawalAmount * estimatedMarketRate;
				const gain = estimatedValue - costBasis;

				if (isExempt) {
					exemptWithdrawalGain += gain;
				} else {
					withdrawalGain += gain;
				}

				oldestPurchase.remaining -= remainingWithdrawalAmount;
				remainingWithdrawalAmount = 0;
			}
		}

		if (exemptWithdrawalGain > 0 || withdrawalGain > 0) {
			console.log(
				`🏦 Withdrawal (${tx.source}) on ${tx.date}: ${formatBTC(btcAmount)} BTC @ €${formatNumber(estimatedMarketRate)}/BTC - Taxable: ${formatNumber(withdrawalGain)} EUR, Tax-free (>1yr): ${formatNumber(exemptWithdrawalGain)} EUR`,
			);
		}
	}

	return {
		btcAmount,
		eurValue: btcAmount * estimatedMarketRate,
		taxableGain: withdrawalGain,
		exemptGain: exemptWithdrawalGain,
	};
}

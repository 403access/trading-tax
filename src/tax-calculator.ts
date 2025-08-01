import type { PurchaseEntry, TaxResults, UnifiedTransaction } from "./types.js";
import { formatBTC, formatNumber, isHeldOverOneYear } from "./utils.js";

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
					const costBasis =
						oldestPurchase.remaining * oldestPurchase.pricePerBTC;
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

			totalTaxableGain += saleGain;
			totalExemptGain += exemptGain;

			if (exemptGain > 0) {
				console.log(
					`💰 Sale on ${tx.date}: ${formatBTC(btcAmount)} BTC - Taxable: ${formatNumber(saleGain)} EUR, Tax-free (>1yr): ${formatNumber(exemptGain)} EUR`,
				);
			}

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
				let exemptWithdrawalGain = 0;

				while (remainingWithdrawalAmount > 0 && purchaseQueue.length > 0) {
					const oldestPurchase = purchaseQueue[0];
					if (!oldestPurchase) break;

					const isExempt = isHeldOverOneYear(oldestPurchase.date, tx.date);

					if (oldestPurchase.remaining <= remainingWithdrawalAmount) {
						const costBasis =
							oldestPurchase.remaining * oldestPurchase.pricePerBTC;
						const estimatedValue =
							oldestPurchase.remaining * estimatedMarketRate;
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
						const estimatedValue =
							remainingWithdrawalAmount * estimatedMarketRate;
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

				totalTaxableGain += withdrawalGain;
				totalExemptGain += exemptWithdrawalGain;

				if (exemptWithdrawalGain > 0) {
					console.log(
						`🏦 Withdrawal (${tx.source}) on ${tx.date}: ${formatBTC(btcAmount)} BTC - Taxable: ${formatNumber(withdrawalGain)} EUR, Tax-free (>1yr): ${formatNumber(exemptWithdrawalGain)} EUR`,
					);
				}
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

	return {
		totalTaxableGain,
		totalExemptGain,
		totalBuyEUR,
		totalSellEUR,
		totalWithdrawnBTC,
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

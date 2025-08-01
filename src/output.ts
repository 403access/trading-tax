import type { TaxResults } from "./types.js";
import { formatBTC, formatNumber } from "./utils.js";

// Output tax calculation results
export function displayResults(results: TaxResults): void {
	console.log("=== UNIFIED CRYPTO TAX CALCULATION ===");
	console.log("");
	console.log("=== TRADING OVERVIEW ===");
	console.log("Total Bought (EUR):", formatNumber(results.totalBuyEUR));
	console.log("Total Sold (EUR):", formatNumber(results.totalSellEUR));
	console.log(
		"Simple Profit (EUR):",
		formatNumber(results.totalSellEUR - results.totalBuyEUR),
	);
	console.log("");
	console.log("=== TAX RELEVANT (FIFO Method) ===");
	console.log("Taxable Gain (EUR):", formatNumber(results.totalTaxableGain));
	console.log(
		"Tax-free Gain >1yr (EUR):",
		formatNumber(results.totalExemptGain),
	);
	console.log(
		"Total Gain (EUR):",
		formatNumber(results.totalTaxableGain + results.totalExemptGain),
	);
	console.log("⚠️  IMPORTANT: Withdrawals are treated as disposals!");
	console.log(
		"⚠️  Market prices at withdrawals are estimated (last purchase price)!",
	);
	console.log("⚠️  Use actual market prices for accurate tax calculation!");
	console.log(
		"✅ German tax law: Gains from crypto held >1 year are tax-exempt!",
	);
	console.log("");
	console.log("=== DEPOSIT & MOVEMENT SUMMARY ===");
	console.log("Total Deposited (BTC):", formatBTC(results.totalDepositedBTC));
	console.log(
		"Total Deposited (EUR):",
		formatNumber(results.totalDepositedEUR),
	);
	console.log("Total Withdrawn (BTC):", formatBTC(results.totalWithdrawnBTC));
	console.log("Total Fees (BTC):", formatBTC(results.totalFeeBTC));
	console.log(
		"ℹ️  Note: Only Bitcoin (BTC) and Euro (EUR) movements are tracked. Other cryptocurrencies are ignored.",
	);
	console.log("");
	console.log("=== TRANSACTION STATISTICS ===");
	console.log("Buys:", results.stats.buys);
	console.log("Sells:", results.stats.sells);
	console.log("Deposits:", results.stats.deposits);
	console.log("Withdrawals:", results.stats.withdrawals);
	console.log("Fee transactions:", results.stats.fees);
	console.log("");

	// Show remaining purchase queue
	if (results.remainingPurchases.length > 0) {
		console.log("=== REMAINING PURCHASES (not yet sold) ===");
		let totalRemainingBTC = 0;
		let totalRemainingEUR = 0;
		for (const purchase of results.remainingPurchases) {
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

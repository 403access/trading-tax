import type { TaxResults } from "../core/types";
import { formatBTC, formatNumber } from "../core/utils";
import { logger } from "../core/logger";

// Output tax calculation results
export function displayResults(results: TaxResults): void {
	logger.info("=== UNIFIED CRYPTO TAX CALCULATION ===");
	logger.info("");
	logger.info("=== TRADING OVERVIEW ===");
	logger.info("Total Bought (EUR):", formatNumber(results.totalBuyEUR));
	logger.info("Total Sold (EUR):", formatNumber(results.totalSellEUR));
	logger.info(
		"Simple EUR-only Profit:",
		formatNumber(results.totalSellEUR - results.totalBuyEUR),
	);
	logger.info("");
	logger.info(
		"💡 NOTE: Simple profit is negative because withdrawals (",
		formatBTC(results.totalWithdrawnBTC),
		"BTC) are not valued in EUR.",
	);
	logger.info(
		"💡 Actual profit calculation below includes market-priced withdrawals!",
	);
	logger.info("");
	logger.info(
		"=== TAX RELEVANT (FIFO Method with Market-Priced Withdrawals) ===",
	);
	logger.info("Taxable Gain (EUR):", formatNumber(results.totalTaxableGain));
	logger.info(
		"Tax-free Gain >1yr (EUR):",
		formatNumber(results.totalExemptGain),
	);
	logger.info(
		"Total Realized Gain (EUR):",
		formatNumber(results.totalTaxableGain + results.totalExemptGain),
	);
	logger.info(
		"⚠️  IMPORTANT: Withdrawals are treated as disposals at market price!",
	);
	logger.info(
		"📊 Using historical Bitcoin prices from Kraken data (2016-2017)",
	);
	logger.info(
		"✅ German tax law: Gains from crypto held >1 year are tax-exempt!",
	);
	logger.info("");
	logger.info("=== DEPOSIT & MOVEMENT SUMMARY ===");
	logger.info("Total Deposited (BTC):", formatBTC(results.totalDepositedBTC));
	logger.info(
		"Total Deposited (EUR):",
		formatNumber(results.totalDepositedEUR),
	);
	logger.info("Total Withdrawn (BTC):", formatBTC(results.totalWithdrawnBTC));
	logger.info(
		"Total Withdrawn (EUR):",
		formatNumber(results.totalWithdrawnEUR),
	);
	logger.info("Total Transferred (BTC):", formatBTC(results.totalTransferredBTC));
	logger.info("Total Fees (BTC):", formatBTC(results.totalFeeBTC));
	logger.info(
		"ℹ️  Note: Only Bitcoin (BTC) and Euro (EUR) movements are tracked. Other cryptocurrencies are ignored.",
	);
	logger.info(
		"🔄 Transfers: Movements between exchanges are not taxable events.",
	);
	logger.info("");
	logger.info("=== TRANSACTION STATISTICS ===");
	logger.info("Buys:", results.stats.buys);
	logger.info("Sells:", results.stats.sells);
	logger.info("Deposits:", results.stats.deposits);
	logger.info("Withdrawals:", results.stats.withdrawals);
	logger.info("Transfers:", results.stats.transfers);
	logger.info("Fee transactions:", results.stats.fees);
	logger.info("");

	// Show remaining purchase queue
	if (results.remainingPurchases.length > 0) {
		logger.info("=== REMAINING PURCHASES (not yet sold) ===");
		let totalRemainingBTC = 0;
		let totalRemainingEUR = 0;
		for (const purchase of results.remainingPurchases) {
			totalRemainingBTC += purchase.remaining;
			totalRemainingEUR += purchase.remaining * purchase.pricePerBTC;
			logger.info(
				`${purchase.date} (${purchase.source}): ${formatBTC(purchase.remaining)} BTC at ${formatNumber(purchase.pricePerBTC)} EUR/BTC`,
			);
		}
		logger.info(
			`Total remaining: ${formatBTC(totalRemainingBTC)} BTC (Value: ${formatNumber(totalRemainingEUR)} EUR)`,
		);
	}
}

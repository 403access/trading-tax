import type { TaxResults } from "../core/types";
import { formatBTC, formatNumber } from "../core/utils";
import { logger } from "../core/logger";
import {
	getAnnualExemption,
	shouldShowOptimizationTips,
} from "../core/tax-config.js";
import { calculateProgressiveTax } from "../packages/tax/index.js";

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

	// Enhanced German tax analysis with configurable exemption and progressive tax calculations
	const annualExemption = getAnnualExemption(); // Get exemption from configuration
	const currentYear = new Date().getFullYear(); // Use current year for tax calculations

	if (results.totalTaxableGain <= annualExemption) {
		logger.info(
			`✅ Annual Exemption: Under €${formatNumber(annualExemption)} - no tax owed on crypto gains!`,
		);
	} else {
		const exemptAmount = Math.min(results.totalTaxableGain, annualExemption);
		const taxableAfterExemption = Math.max(
			results.totalTaxableGain - annualExemption,
			0,
		);

		logger.info("");
		logger.info("📋 German Tax Analysis (§23 EStG):");
		logger.info(`   Annual exemption applied: €${formatNumber(exemptAmount)}`);
		logger.info(
			`   Taxable amount after exemption: €${formatNumber(taxableAfterExemption)}`,
		);

		// Calculate progressive tax estimates for different income scenarios using year-appropriate calculations
		if (taxableAfterExemption > 0) {
			// Show progressive calculations for specific income scenarios
			const scenarios = [
				{ income: 30000, label: "€30,000 income" },
				{ income: 50000, label: "€50,000 income" },
				{ income: 80000, label: "€80,000 income" },
			];

			logger.info("   Progressive tax scenarios:");
			for (const scenario of scenarios) {
				const { tax, rate } = calculateProgressiveTax(
					scenario.income,
					taxableAfterExemption,
					currentYear,
				);
				const percentage = (rate * 100).toFixed(1);
				logger.info(
					`   • On ${scenario.label}: €${formatNumber(tax)} tax (${percentage}% marginal rate)`,
				);
			}

			logger.info(
				"   💡 Tax rate depends on your total annual income (progressive taxation)",
			);
		}
	}
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

	// Enhanced tax strategy recommendations
	if (
		results.totalTaxableGain > annualExemption &&
		shouldShowOptimizationTips()
	) {
		logger.info("💡 Tax Optimization Tips:");
		logger.info("   • Hold crypto >1 year for complete tax exemption");
		logger.info("   • Consider timing of sales to manage annual gains");
		logger.info("   • December→January sales are fully taxable (short-term)");
		logger.info("   • Tax rate depends on your total annual income");
		logger.info("");
	}
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
	logger.info(
		"Total Transferred (BTC):",
		formatBTC(results.totalTransferredBTC),
	);
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

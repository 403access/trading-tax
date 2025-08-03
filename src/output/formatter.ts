import type { TaxResults, PurchaseEntry } from "../core/types";
import { formatBTC, formatNumber, formatAsset } from "../core/utils";
import { logger } from "../core/logger";
import {
	getAnnualExemption,
	shouldShowOptimizationTips,
	getBaseAnnualIncome,
	shouldApplyIncomeTax,
	getTaxYear,
	shouldTrackStakingIncome,
	getStakingIncomeExemption,
} from "../core/tax-config.js";
import {
	calculateProgressiveTax,
	calculateTaxForYear,
} from "../packages/tax/index";

// Helper function to format asset totals
function formatAssetTotals(
	assetTotals: Record<string, number>,
	label: string,
): void {
	logger.info(`${label}:`);
	const assets = Object.keys(assetTotals).sort();
	if (assets.length === 0) {
		logger.info("  (none)");
		return;
	}
	for (const asset of assets) {
		const amount = assetTotals[asset];
		logger.info(`  ${formatAsset(amount ?? 0, asset)}`);
	}
}

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

	// Display year-based trading breakdown
	const years = Object.keys(results.tradingByYear).sort();
	if (years.length > 1) {
		logger.info("");
		logger.info("📊 Trading by Year:");
		for (const year of years) {
			const yearData = results.tradingByYear[year];
			if (!yearData) continue;

			const profit = yearData.sellEUR - yearData.buyEUR;
			logger.info(
				`   ${year}: Bought €${formatNumber(yearData.buyEUR)}, Sold €${formatNumber(yearData.sellEUR)}, Profit €${formatNumber(profit)}`,
			);
		}
	}

	logger.info("");
	logger.info(
		"💡 NOTE: Simple profit is negative because withdrawals are not valued in EUR.",
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

	logger.info("");
	logger.info("📊 Tax Summary by Transaction Year:");
	logger.info(
		"   💡 See detailed transaction log above for individual sales breakdown",
	);

	// Enhanced German tax analysis with configurable exemption and income tax calculations
	const annualExemption = getAnnualExemption();
	const baseIncome = getBaseAnnualIncome();
	const applyIncomeTax = shouldApplyIncomeTax();
	const taxYear = getTaxYear();

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

		if (baseIncome > 0) {
			logger.info(`   Base annual income: €${formatNumber(baseIncome)}`);
			logger.info(
				`   Total taxable income: €${formatNumber(baseIncome + taxableAfterExemption)}`,
			);
		}

		// Calculate actual income tax if enabled
		if (applyIncomeTax && taxableAfterExemption > 0) {
			if (baseIncome > 0) {
				// Calculate additional tax on crypto gains
				const { tax: additionalTax, rate } = calculateProgressiveTax(
					baseIncome,
					taxableAfterExemption,
					taxYear,
				);
				logger.info("");
				logger.info("💰 Income Tax Calculation:");
				logger.info(
					`   Additional tax on crypto gains: €${formatNumber(additionalTax)}`,
				);
				logger.info(`   Effective marginal rate: ${(rate * 100).toFixed(1)}%`);
			} else {
				// Calculate total tax on crypto gains only
				const totalTax = calculateTaxForYear(taxableAfterExemption, taxYear);
				const effectiveRate =
					taxableAfterExemption > 0 ? totalTax / taxableAfterExemption : 0;
				logger.info("");
				logger.info("💰 Income Tax Calculation:");
				logger.info(`   Total tax on crypto gains: €${formatNumber(totalTax)}`);
				logger.info(`   Effective rate: ${(effectiveRate * 100).toFixed(1)}%`);
			}
		}

		// Show progressive scenarios for comparison
		if (taxableAfterExemption > 0) {
			// Show progressive calculations for different income scenarios
			const scenarios = [
				{ income: 30000, label: "€30,000 income" },
				{ income: 50000, label: "€50,000 income" },
				{ income: 80000, label: "€80,000 income" },
			];

			logger.info("   Progressive tax scenarios (for comparison):");
			for (const scenario of scenarios) {
				const { tax, rate } = calculateProgressiveTax(
					scenario.income,
					taxableAfterExemption,
					taxYear,
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

		// Add yearly breakdown note
		logger.info("");
		logger.info("📅 Year-by-Year Analysis:");
		logger.info(
			"   💡 For detailed sales breakdown by year, see transaction log above",
		);
		logger.info(
			"   💡 Remaining purchases section shows holdings by acquisition year",
		);
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

	// Enhanced staking analysis
	if (shouldTrackStakingIncome() && results.stakingRewards.length > 0) {
		const stakingExemption = getStakingIncomeExemption();
		logger.info("");
		logger.info("=== STAKING REWARDS ANALYSIS ===");
		logger.info(
			`Total staking income: €${formatNumber(results.totalStakingIncomeEUR)}`,
		);

		if (results.totalStakingIncomeEUR <= stakingExemption) {
			logger.info(
				`✅ Under €${formatNumber(stakingExemption)} exemption - no additional tax on staking rewards!`,
			);
		} else {
			const taxableStakingIncome =
				results.totalStakingIncomeEUR - stakingExemption;
			logger.info(`📋 Staking Income Tax (§22 Nr. 3 EStG):`);
			logger.info(`   Exemption applied: €${formatNumber(stakingExemption)}`);
			logger.info(
				`   Taxable staking income: €${formatNumber(taxableStakingIncome)}`,
			);
			logger.info(
				`   💡 This income is added to your regular income tax calculation`,
			);
		}

		logger.info("");
		logger.info("📊 Staking Rewards Details:");

		// Group rewards by year
		const rewardsByYear: Record<string, typeof results.stakingRewards> = {};
		for (const reward of results.stakingRewards) {
			const year = new Date(reward.date).getFullYear().toString();
			if (!rewardsByYear[year]) {
				rewardsByYear[year] = [];
			}
			rewardsByYear[year].push(reward);
		}

		// Display by year in chronological order
		const years = Object.keys(rewardsByYear).sort();
		for (const year of years) {
			const yearRewards = rewardsByYear[year];
			if (!yearRewards) continue;

			const yearTotal = yearRewards.reduce(
				(sum, reward) => sum + reward.eurValue,
				0,
			);

			logger.info(
				`   ${year} (${yearRewards.length} rewards, €${formatNumber(yearTotal)} total):`,
			);
			for (const reward of yearRewards) {
				const date = reward.date.slice(5); // Remove year prefix (YYYY-)
				logger.info(
					`     ${date}: ${formatAsset(reward.amount, reward.asset)} ${reward.asset} = €${formatNumber(reward.eurValue)} (${reward.source})`,
				);
			}
			if (years.length > 1) logger.info(""); // Add spacing between years
		}

		logger.info("");
		logger.info(
			"⚠️  IMPORTANT: Staked crypto has extended 10-year holding period!",
		);
		logger.info("💡 Staking rewards are taxable as income when received");
	} else if (
		shouldTrackStakingIncome() &&
		results.stakingRewards.length === 0
	) {
		logger.info("");
		logger.info("=== STAKING REWARDS ANALYSIS ===");
		logger.info("No staking rewards found in transaction data.");
	}

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
	formatAssetTotals(results.totalDepositedAssets, "Total Deposited");
	logger.info(
		"Total Deposited (EUR):",
		formatNumber(results.totalDepositedEUR),
	);
	formatAssetTotals(results.totalWithdrawnAssets, "Total Withdrawn");
	logger.info(
		"Total Withdrawn (EUR):",
		formatNumber(results.totalWithdrawnEUR),
	);
	formatAssetTotals(results.totalTransferredAssets, "Total Transferred");
	formatAssetTotals(results.totalFeeAssets, "Total Fees");
	logger.info(
		"ℹ️  Note: All cryptocurrency movements are tracked across BTC, ETH, SOL, and other assets.",
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
	if (shouldTrackStakingIncome()) {
		logger.info("Staking rewards:", results.stats.stakingRewards);
	}
	logger.info("");

	// Show remaining purchase queue
	if (results.remainingPurchases.length > 0) {
		logger.info("=== REMAINING PURCHASES (not yet sold) ===");

		// Group purchases by year
		const purchasesByYear: Record<string, typeof results.remainingPurchases> =
			{};
		const remainingByAsset: Record<string, { amount: number; value: number }> =
			{};
		let totalRemainingEUR = 0;

		for (const purchase of results.remainingPurchases) {
			const year = new Date(purchase.date).getFullYear().toString();
			if (!purchasesByYear[year]) {
				purchasesByYear[year] = [];
			}
			purchasesByYear[year].push(purchase);

			const asset = purchase.asset;
			const eurValue = purchase.remaining * purchase.pricePerAsset;
			if (!remainingByAsset[asset]) {
				remainingByAsset[asset] = { amount: 0, value: 0 };
			}
			remainingByAsset[asset].amount += purchase.remaining;
			remainingByAsset[asset].value += eurValue;
			totalRemainingEUR += eurValue;
		}

		// Display by year in chronological order
		const years = Object.keys(purchasesByYear).sort();
		for (const year of years) {
			const yearPurchases = purchasesByYear[year];
			if (!yearPurchases) continue;

			const yearValue = yearPurchases.reduce(
				(sum, p) => sum + p.remaining * p.pricePerAsset,
				0,
			);
			logger.info(
				`${year} (${yearPurchases.length} purchases, €${formatNumber(yearValue)} value):`,
			);

			for (const purchase of yearPurchases) {
				const date = purchase.date.slice(5); // Remove year prefix (YYYY-)
				logger.info(
					`  ${date} (${purchase.source}): ${formatAsset(purchase.remaining, purchase.asset)} at ${formatNumber(purchase.pricePerAsset)} EUR/${purchase.asset}`,
				);
			}
			if (years.length > 1) logger.info(""); // Add spacing between years
		}

		logger.info("Summary by asset:");
		for (const [asset, data] of Object.entries(remainingByAsset)) {
			logger.info(
				`  ${formatAsset(data.amount, asset)} (Value: ${formatNumber(data.value)} EUR)`,
			);
		}
		logger.info(
			`Total remaining value: ${formatNumber(totalRemainingEUR)} EUR`,
		);
	}
}

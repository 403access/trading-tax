import { logger } from "../../shared/logger";
import type { TaxResults } from "../../shared/types";
import { formatNumber } from "../../shared/utils";
import {
	calculateProgressiveTax,
	calculateTaxForYear,
} from "../../tax-calculations/index";
import {
	getAnnualExemption,
	getBaseAnnualIncome,
	getTaxYear,
	shouldApplyIncomeTax,
} from "../../tax-calculations/tax-config.js";

/**
 * Displays comprehensive tax analysis including German tax calculations
 */
export function displayTaxAnalysis(results: TaxResults): void {
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
		displayExemptGains(annualExemption);
	} else {
		displayTaxableGains(
			results,
			annualExemption,
			baseIncome,
			applyIncomeTax,
			taxYear,
		);
	}

	displayTaxNotes();
}

/**
 * Displays information when gains are under the annual exemption
 */
function displayExemptGains(annualExemption: number): void {
	logger.info(
		`✅ Annual Exemption: Under €${formatNumber(annualExemption)} - no tax owed on crypto gains!`,
	);
}

/**
 * Displays detailed tax calculations when gains exceed exemption
 */
function displayTaxableGains(
	results: TaxResults,
	annualExemption: number,
	baseIncome: number,
	applyIncomeTax: boolean,
	taxYear: number,
): void {
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
		displayIncomeTaxCalculation(baseIncome, taxableAfterExemption, taxYear);
	}

	// Show progressive scenarios for comparison
	if (taxableAfterExemption > 0) {
		displayProgressiveScenarios(taxableAfterExemption, taxYear);
	}

	displayYearlyAnalysisNote();
}

/**
 * Displays income tax calculations
 */
function displayIncomeTaxCalculation(
	baseIncome: number,
	taxableAfterExemption: number,
	taxYear: number,
): void {
	logger.info("");
	logger.info("💰 Income Tax Calculation:");

	if (baseIncome > 0) {
		// Calculate additional tax on crypto gains
		const { tax: additionalTax, rate } = calculateProgressiveTax(
			baseIncome,
			taxableAfterExemption,
			taxYear,
		);
		logger.info(
			`   Additional tax on crypto gains: €${formatNumber(additionalTax)}`,
		);
		logger.info(`   Effective marginal rate: ${(rate * 100).toFixed(1)}%`);
	} else {
		// Calculate total tax on crypto gains only
		const totalTax = calculateTaxForYear(taxableAfterExemption, taxYear);
		const effectiveRate =
			taxableAfterExemption > 0 ? totalTax / taxableAfterExemption : 0;
		logger.info(`   Total tax on crypto gains: €${formatNumber(totalTax)}`);
		logger.info(`   Effective rate: ${(effectiveRate * 100).toFixed(1)}%`);
	}
}

/**
 * Displays progressive tax scenarios for different income levels
 */
function displayProgressiveScenarios(
	taxableAfterExemption: number,
	taxYear: number,
): void {
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

/**
 * Displays yearly analysis notes
 */
function displayYearlyAnalysisNote(): void {
	logger.info("");
	logger.info("📅 Year-by-Year Analysis:");
	logger.info(
		"   💡 For detailed sales breakdown by year, see transaction log above",
	);
	logger.info(
		"   💡 Remaining purchases section shows holdings by acquisition year",
	);
}

/**
 * Displays important tax-related notes
 */
function displayTaxNotes(): void {
	logger.info(
		"⚠️  IMPORTANT: Withdrawals are treated as disposals at market price!",
	);
	logger.info(
		"📊 Using historical Bitcoin prices from Kraken data (2016-2017)",
	);
	logger.info(
		"✅ German tax law: Gains from crypto held >1 year are tax-exempt!",
	);
}

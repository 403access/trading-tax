import fs from "fs";
import path from "path";

interface TaxConfig {
	exemptions: {
		annualPrivateSalesExemption: number;
		holdingPeriodExemption: {
			months: number;
			description: string;
		};
	};
	taxCalculation: {
		baseAnnualIncome: number;
		applyIncomeTax: boolean;
		taxYear: number;
	};
	displayOptions: {
		showDetailedTaxAnalysis: boolean;
		showOptimizationTips: boolean;
	};
}

let cachedConfig: TaxConfig | null = null;

export function loadTaxConfig(): TaxConfig {
	if (cachedConfig) {
		return cachedConfig;
	}

	const configPath = path.resolve(process.cwd(), "config/tax-rules.json");
	const configData = fs.readFileSync(configPath, "utf-8");
	cachedConfig = JSON.parse(configData) as TaxConfig;

	return cachedConfig;
}

export function getAnnualExemption(): number {
	const config = loadTaxConfig();
	return config.exemptions.annualPrivateSalesExemption;
}

export function getHoldingPeriodMonths(): number {
	const config = loadTaxConfig();
	return config.exemptions.holdingPeriodExemption.months;
}

export function shouldShowDetailedAnalysis(): boolean {
	const config = loadTaxConfig();
	return config.displayOptions.showDetailedTaxAnalysis;
}

export function shouldShowOptimizationTips(): boolean {
	const config = loadTaxConfig();
	return config.displayOptions.showOptimizationTips;
}

export function getBaseAnnualIncome(): number {
	const config = loadTaxConfig();
	return config.taxCalculation.baseAnnualIncome;
}

export function shouldApplyIncomeTax(): boolean {
	const config = loadTaxConfig();
	return config.taxCalculation.applyIncomeTax;
}

export function getTaxYear(): number {
	const config = loadTaxConfig();
	return config.taxCalculation.taxYear;
}

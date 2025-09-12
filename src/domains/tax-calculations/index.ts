// Tax Calculations Domain Barrel Export
// German tax law compliance and FIFO calculations

// German tax tariff data
export {
	TARIFF_2022,
	TARIFF_2023,
	TARIFF_2024 as currentTariff,
} from "./data/index";

// Tax helpers
export {
	calculateProgressiveTax,
	calculateTaxForYear,
	getAvailableTaxYears,
} from "./helpers";

// Main calculator
export { calculateTax, processTransactions } from "./tax-calculator";

// Tax configuration
export {
	getAnnualExemption,
	getHoldingPeriodMonths,
	loadTaxConfig,
	shouldApplyIncomeTax,
} from "./tax-config";

// Transfer detection
export { detectTransfers } from "./transfer-detection";

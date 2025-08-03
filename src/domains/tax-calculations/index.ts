// Tax Calculations Domain Barrel Export
// German tax law compliance and FIFO calculations

// Main calculator
export { calculateTax, processTransactions } from "./tax-calculator";

// Transfer detection
export { detectTransfers } from "./transfer-detection";

// Tax helpers
export {
	calculateTaxForYear,
	calculateProgressiveTax,
	getAvailableTaxYears,
} from "./helpers";

// Tax configuration
export {
	loadTaxConfig,
	getAnnualExemption,
	getHoldingPeriodMonths,
	shouldApplyIncomeTax,
} from "./tax-config";

// German tax tariff data
export {
	TARIFF_2024 as currentTariff,
	TARIFF_2023,
	TARIFF_2022,
} from "./data/index";

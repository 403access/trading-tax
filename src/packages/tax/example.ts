import {
	calculateProgressiveTax,
	calculateTaxForYear,
	getAvailableTaxYears,
	isTaxYearSupported,
} from "./helpers";

// Example: Compare old and new API
console.log("=== Tax Package API Examples ===\n");

// 1. Legacy API still works
const income2025Legacy = calculateTaxForYear(50000, 2025);
console.log(`Legacy API - est2025(50000): €${income2025Legacy}`);

// 2. New flexible API
const income2025New = calculateTaxForYear(50000, 2025);
console.log(`New API - calculateTaxForYear(50000, 2025): €${income2025New}`);
console.log(
	`Both methods return same result: ${income2025Legacy === income2025New}\n`,
);

// 3. Progressive tax calculation example
console.log("=== Progressive Tax Examples ===");
const baseIncome = 40000;
const cryptoGains = 10000;

for (const year of [2023, 2024, 2025]) {
	const result = calculateProgressiveTax(baseIncome, cryptoGains, year);
	console.log(
		`${year}: €${cryptoGains} crypto gains on €${baseIncome} base income = €${Math.round(
			result.tax,
		)} additional tax (${(result.rate * 100).toFixed(1)}% marginal rate)`,
	);
}

// 4. Utility functions
console.log("\n=== Tax Year Information ===");
console.log(`Available tax years: ${getAvailableTaxYears().join(", ")}`);
console.log(`Is 2025 supported: ${isTaxYearSupported(2025)}`);
console.log(`Is 2030 supported: ${isTaxYearSupported(2030)}`);

// 5. Cross-year comparison
console.log("\n=== Cross-Year Tax Comparison ===");
const testIncome = 75000;
for (const year of [2020, 2023, 2025]) {
	const tax = calculateTaxForYear(testIncome, year);
	console.log(`${year}: €${testIncome} income = €${tax} tax`);
}

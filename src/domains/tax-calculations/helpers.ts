import { calculateESt } from "./calculate";
import { tariff2016 } from "./data/tariff2016";
import { tariff2017 } from "./data/tariff2017";
import { tariff2018 } from "./data/tariff2018";
import { tariff2019 } from "./data/tariff2019";
import { tariff2020 } from "./data/tariff2020";
import { tariff2021 } from "./data/tariff2021";
import { tariff2022 } from "./data/tariff2022";
import { tariff2023 } from "./data/tariff2023";
import { tariff2024 } from "./data/tariff2024";
import { tariff2025 } from "./data/tariff2025";
import type { TaxZone } from "./model";

// Map years to their corresponding tariff data
const tariffMap: Record<number, TaxZone[]> = {
	2016: tariff2016,
	2017: tariff2017,
	2018: tariff2018,
	2019: tariff2019,
	2020: tariff2020,
	2021: tariff2021,
	2022: tariff2022,
	2023: tariff2023,
	2024: tariff2024,
	2025: tariff2025,
};

/**
 * Calculate German income tax (Einkommensteuer) for a given year
 * @param zvE - Zu versteuerndes Einkommen (taxable income) in EUR
 * @param year - Tax year (2016-2025)
 * @returns Tax amount in EUR (rounded down to whole euros)
 */
export function calculateTaxForYear(zvE: number, year: number): number {
	const tariff = tariffMap[year] || tariff2025; // Default to latest year
	return Math.floor(calculateESt(zvE, tariff));
}

/**
 * Calculate progressive tax on additional income
 * @param baseIncome - Base annual income in EUR
 * @param additionalIncome - Additional income (e.g., crypto gains) in EUR
 * @param year - Tax year for calculation
 * @returns Object with additional tax and effective rate
 */
export function calculateProgressiveTax(
	baseIncome: number,
	additionalIncome: number,
	year: number,
): { tax: number; rate: number } {
	const totalTax = calculateTaxForYear(baseIncome + additionalIncome, year);
	const baseTax = calculateTaxForYear(baseIncome, year);
	const additionalTax = totalTax - baseTax;

	const effectiveRate =
		additionalIncome > 0 ? additionalTax / additionalIncome : 0;

	return {
		tax: additionalTax,
		rate: effectiveRate,
	};
}

/**
 * Get all available tax years
 */
export function getAvailableTaxYears(): number[] {
	return Object.keys(tariffMap).map(Number).sort();
}

/**
 * Check if a tax year is supported
 */
export function isTaxYearSupported(year: number): boolean {
	return year in tariffMap;
}

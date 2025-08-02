export function toNumber(value: string): number {
	const num = parseFloat(value.replace(",", "."));
	return Number.isNaN(num) ? 0 : num;
}

export function formatNumber(num: number): string {
	const str = num.toFixed(2);
	const [integerPart, decimalPart] = str.split(".");
	const formattedInteger = (integerPart || "0").replace(
		/\B(?=(\d{3})+(?!\d))/g,
		" ",
	);
	return `${formattedInteger}.${decimalPart || "00"}`;
}

export function formatBTC(num: number): string {
	const str = num.toFixed(8);
	const [integerPart, decimalPart] = str.split(".");
	const formattedInteger = (integerPart || "0").replace(
		/\B(?=(\d{3})+(?!\d))/g,
		" ",
	);
	return `${formattedInteger}.${decimalPart || "00000000"}`;
}

// German tax law: 1-year holding period for crypto exemption (§23 EStG)
export function isHeldOverOneYear(
	purchaseDate: string,
	disposalDate: string,
): boolean {
	const purchase = new Date(purchaseDate);
	const disposal = new Date(disposalDate);

	// Add exactly 12 months to purchase date
	const exemptionDate = new Date(purchase);
	exemptionDate.setMonth(purchase.getMonth() + 12);

	return disposal >= exemptionDate;
}

// Calculate holding period details for tax analysis
export function getHoldingPeriodDetails(
	purchaseDate: string,
	disposalDate: string,
): { days: number; months: number; isExempt: boolean; status: string } {
	const purchase = new Date(purchaseDate);
	const disposal = new Date(disposalDate);

	// Calculate holding period in days
	const holdingDays = Math.floor(
		(disposal.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24),
	);
	const holdingMonths = Math.floor(holdingDays / 30.44); // Average days per month

	const isExempt = isHeldOverOneYear(purchaseDate, disposalDate);

	let status: string;
	if (isExempt) {
		status = "Tax-exempt (>12mo)";
	} else if (holdingDays < 30) {
		status = "Short-term (<1mo)";
	} else {
		status = `Short-term (${holdingMonths}mo)`;
	}

	return {
		days: holdingDays,
		months: holdingMonths,
		isExempt,
		status,
	};
}

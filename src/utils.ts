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

// German tax law: One-year holding period for crypto exemption
export function isHeldOverOneYear(
	purchaseDate: string,
	disposalDate: string,
): boolean {
	const purchase = new Date(purchaseDate);
	const disposal = new Date(disposalDate);
	const oneYearLater = new Date(purchase);
	oneYearLater.setFullYear(purchase.getFullYear() + 1);
	return disposal >= oneYearLater;
}

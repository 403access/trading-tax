/**
 * Utilities for parsing German date and number formats
 */

/**
 * Parse German date format (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
 * @param dateStr - Date string in German format
 * @returns ISO date string or null if parsing fails
 */
export function parseGermanDate(dateStr: string): string | null {
	try {
		// Remove quotes if present
		const cleanDate = dateStr.replace(/"/g, "");
		const [day, month, year] = cleanDate.split(".");
		if (day && month && year) {
			return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
		}
	} catch {
		// Ignore parsing errors
	}
	return null;
}

/**
 * Parse German number format (comma as decimal separator, K suffix for thousands)
 * @param numStr - Number string in German format
 * @returns Parsed number or 0 if parsing fails
 */
export function parseGermanNumber(numStr: string): number {
	try {
		// Remove quotes first
		let cleanStr = numStr.replace(/"/g, "");

		// Remove any K suffix and handle thousands
		const hasKSuffix = cleanStr.includes("K");
		cleanStr = cleanStr.replace("K", "");

		// For German format: replace thousands separators (.) and decimal comma (,)
		cleanStr = cleanStr
			.replace(/\./g, "") // Remove thousands separator
			.replace(",", "."); // Replace decimal comma with dot

		const num = parseFloat(cleanStr);

		// If original had K suffix, multiply by 1000
		if (hasKSuffix) {
			return num * 1000;
		}

		return num;
	} catch {
		return 0;
	}
}

/**
 * Extract date part from date string (removes time component)
 * @param dateStr - Date string potentially with time
 * @returns Date part only or null if invalid
 */
export function extractDateFromString(dateStr: string): string | null {
	const exactDate = dateStr.split(" ")[0]; // Remove time part
	return exactDate || null;
}

import type { UnifiedTransaction } from "../shared/types";

// Helper function to safely load transactions
export function loadTransactions(
	parser: (filePath: string) => UnifiedTransaction[],
	filePath: string,
	sourceName: string,
): UnifiedTransaction[] {
	try {
		const transactions = parser(filePath);
		console.log(
			`Loaded ${transactions.length} transactions from ${sourceName}`,
		);
		return transactions;
	} catch {
		console.log(`No ${sourceName} file found or error reading it`);
		return [];
	}
}

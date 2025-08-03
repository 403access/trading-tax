import type { UnifiedTransaction } from "../shared/types";

export interface DepositResult {
	depositedEUR: number;
}

export function processDepositTransaction(
	tx: UnifiedTransaction,
): DepositResult {
	// For deposits, we just track the EUR value
	// Asset amounts are tracked separately in the tax calculator
	return {
		depositedEUR: Math.abs(tx.eurAmount),
	};
}

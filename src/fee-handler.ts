import type { UnifiedTransaction } from "./types.js";

export function processFeeTransaction(tx: UnifiedTransaction): number {
	if (tx.btcAmount < 0) {
		return Math.abs(tx.btcAmount);
	}
	return 0;
}

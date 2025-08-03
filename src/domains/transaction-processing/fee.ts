import type { UnifiedTransaction } from "../shared/types";

export function processFeeTransaction(tx: UnifiedTransaction): number {
	if (tx.assetAmount < 0) {
		return Math.abs(tx.assetAmount);
	}
	return 0;
}

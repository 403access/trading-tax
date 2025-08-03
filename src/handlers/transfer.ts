import type { UnifiedTransaction } from "../core/types";

export function processTransferTransaction(tx: UnifiedTransaction): void {
	// For transfers, we just log them but don't treat as taxable
	// Asset amounts are tracked separately in the tax calculator
	console.log(
		`🔄 Transfer: ${tx.source} - ${tx.assetAmount.toFixed(8)} ${tx.asset} on ${tx.date} (${tx.transferId})`,
	);
}

import type { UnifiedTransaction } from "../core/types";

export interface TransferResult {
  transferredBTC: number;
}

export function processTransferTransaction(
  tx: UnifiedTransaction
): TransferResult {
  // For transfers, we track the BTC amount moved but don't treat it as taxable
  const transferredBTC = Math.abs(tx.btcAmount);
  
  console.log(`🔄 Transfer: ${tx.source} - ${transferredBTC.toFixed(8)} BTC on ${tx.date} (${tx.transferId})`);
  
  return {
    transferredBTC
  };
}

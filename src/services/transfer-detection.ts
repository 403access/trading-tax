import type { UnifiedTransaction } from "../core/types";

// Configuration for transfer detection
interface TransferDetectionConfig {
  timeToleranceHours: number; // How close in time transactions must be
}

const DEFAULT_CONFIG: TransferDetectionConfig = {
  timeToleranceHours: 720, // 30 days for testing
};

export interface TransferPair {
  withdrawalTx: UnifiedTransaction;
  depositTx: UnifiedTransaction;
  transferId: string;
}

export function detectTransfers(
  transactions: UnifiedTransaction[], 
  config: TransferDetectionConfig = DEFAULT_CONFIG
): TransferPair[] {
  const transfers: TransferPair[] = [];
  
  // Get all withdrawals and deposits
  const withdrawals = transactions.filter(tx => tx.type === "withdrawal");
  const deposits = transactions.filter(tx => tx.type === "deposit");
  
  console.log(`🔍 Analyzing ${withdrawals.length} withdrawals and ${deposits.length} deposits for transfer patterns...`);
  
  // Debug: Show BTC deposits (non-zero amounts) and recent withdrawals
  const btcDeposits = deposits.filter(d => Math.abs(d.btcAmount) > 0.00001);
  const bitcoinDeWithdrawals = withdrawals.filter(w => w.source === "bitcoin.de");
  
  console.log(`📥 BTC deposits (${btcDeposits.length} found):`);
  btcDeposits.forEach(d => 
    console.log(`  ${d.source}: ${Math.abs(d.btcAmount).toFixed(8)} BTC on ${d.date}`)
  );
  console.log(`� Bitcoin.de withdrawals (${bitcoinDeWithdrawals.length} found):`);
  bitcoinDeWithdrawals.slice(-5).forEach(w => 
    console.log(`  ${w.source}: ${Math.abs(w.btcAmount).toFixed(8)} BTC on ${w.date}`)
  );
  
  // Track which transactions we've already matched
  const usedWithdrawals = new Set<number>();
  const usedDeposits = new Set<number>();
  
  for (let i = 0; i < withdrawals.length; i++) {
    if (usedWithdrawals.has(i)) continue;
    
    const withdrawal = withdrawals[i];
    if (!withdrawal) continue;
    
    const withdrawalTime = new Date(withdrawal.date).getTime();
    const withdrawalAmount = Math.abs(withdrawal.btcAmount);
    
    for (let j = 0; j < deposits.length; j++) {
      if (usedDeposits.has(j)) continue;
      
      const deposit = deposits[j];
      if (!deposit) continue;
      
      const depositTime = new Date(deposit.date).getTime();
      const depositAmount = Math.abs(deposit.btcAmount);
      
      // Skip if same exchange (not a transfer)
      if (withdrawal.source === deposit.source) continue;
      
      // Check time proximity (within configured hours)
      const timeDiffHours = Math.abs(depositTime - withdrawalTime) / (1000 * 60 * 60);
      if (timeDiffHours > config.timeToleranceHours) continue;
      
      // Check exact amount match (same BTC amount)
      if (Math.abs(withdrawalAmount - depositAmount) < 0.00000001) {
        const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        transfers.push({
          withdrawalTx: withdrawal,
          depositTx: deposit,
          transferId
        });
        
        usedWithdrawals.add(i);
        usedDeposits.add(j);
        
        const timeDiff = Math.abs(depositTime - withdrawalTime) / (1000 * 60 * 60);
        
        console.log(`🔄 Transfer detected:`);
        console.log(`   📤 Withdrawal: ${withdrawal.source} - ${withdrawalAmount.toFixed(8)} BTC on ${withdrawal.date}`);
        console.log(`   📥 Deposit: ${deposit.source} - ${depositAmount.toFixed(8)} BTC on ${deposit.date}`);
        console.log(`   ⏰ Time difference: ${timeDiff.toFixed(1)} hours`);
        
        break; // Found a match, move to next withdrawal
      }
    }
  }
  
  console.log(`✅ Found ${transfers.length} exact amount transfers between exchanges`);
  return transfers;
}

export function markTransfers(
  transactions: UnifiedTransaction[], 
  transfers: TransferPair[]
): UnifiedTransaction[] {
  // Create a map for quick lookup
  const transferMap = new Map<UnifiedTransaction, string>();
  
  for (const transfer of transfers) {
    transferMap.set(transfer.withdrawalTx, transfer.transferId);
    transferMap.set(transfer.depositTx, transfer.transferId);
  }
  
  // Mark transactions as transfers
  return transactions.map(tx => {
    const transferId = transferMap.get(tx);
    if (transferId) {
      return {
        ...tx,
        type: "transfer" as const,
        transferId
      };
    }
    return tx;
  });
}

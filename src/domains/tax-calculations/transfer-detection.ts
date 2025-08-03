import type { UnifiedTransaction } from "../shared/types";
import { logger } from "../shared/logger";

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
	config: TransferDetectionConfig = DEFAULT_CONFIG,
): TransferPair[] {
	const transfers: TransferPair[] = [];

	// Get all withdrawals and deposits
	const withdrawals = transactions.filter((tx) => tx.type === "withdrawal");
	const deposits = transactions.filter((tx) => tx.type === "deposit");

	logger.log(
		"transferDetection",
		`🔍 Analyzing ${withdrawals.length} withdrawals and ${deposits.length} deposits for transfer patterns...`,
	);

	// Debug: Show BTC deposits (non-zero amounts) and recent withdrawals
	const btcDeposits = deposits.filter(
		(d) => d.asset === "BTC" && Math.abs(d.assetAmount) > 0.00001,
	);
	const bitcoinDeWithdrawals = withdrawals.filter(
		(w) => w.source === "bitcoin.de",
	);

	logger.log(
		"transferDetection",
		`📥 BTC deposits (${btcDeposits.length} found):`,
	);
	btcDeposits.forEach((d) =>
		logger.log(
			"transferDetection",
			`  ${d.source}: ${Math.abs(d.assetAmount).toFixed(8)} ${d.asset} on ${d.date}`,
		),
	);
	logger.log(
		"transferDetection",
		`📤 Bitcoin.de withdrawals (${bitcoinDeWithdrawals.length} found):`,
	);
	bitcoinDeWithdrawals
		.slice(-5)
		.forEach((w) =>
			logger.log(
				"transferDetection",
				`  ${w.source}: ${Math.abs(w.assetAmount).toFixed(8)} ${w.asset} on ${w.date}`,
			),
		);

	// Track which transactions we've already matched
	const usedWithdrawals = new Set<number>();
	const usedDeposits = new Set<number>();

	for (let i = 0; i < withdrawals.length; i++) {
		if (usedWithdrawals.has(i)) continue;

		const withdrawal = withdrawals[i];
		if (!withdrawal) continue;

		const withdrawalTime = new Date(withdrawal.date).getTime();
		const withdrawalAmount = Math.abs(withdrawal.assetAmount);

		for (let j = 0; j < deposits.length; j++) {
			if (usedDeposits.has(j)) continue;

			const deposit = deposits[j];
			if (!deposit) continue;

			const depositTime = new Date(deposit.date).getTime();
			const depositAmount = Math.abs(deposit.assetAmount);

			// Skip if same exchange (not a transfer)
			if (withdrawal.source === deposit.source) continue;

			// Check time proximity (within configured hours)
			const timeDiffHours =
				Math.abs(depositTime - withdrawalTime) / (1000 * 60 * 60);
			if (timeDiffHours > config.timeToleranceHours) continue;

			// Check exact amount match (same BTC amount)
			if (Math.abs(withdrawalAmount - depositAmount) < 0.00000001) {
				const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

				transfers.push({
					withdrawalTx: withdrawal,
					depositTx: deposit,
					transferId,
				});

				usedWithdrawals.add(i);
				usedDeposits.add(j);

				const timeDiff =
					Math.abs(depositTime - withdrawalTime) / (1000 * 60 * 60);

				logger.log("transferDetection", `🔄 Transfer detected:`);
				logger.log(
					"transferDetection",
					`   📤 Withdrawal: ${withdrawal.source} - ${withdrawalAmount.toFixed(8)} BTC on ${withdrawal.date}`,
				);
				logger.log(
					"transferDetection",
					`   📥 Deposit: ${deposit.source} - ${depositAmount.toFixed(8)} BTC on ${deposit.date}`,
				);
				logger.log(
					"transferDetection",
					`   ⏰ Time difference: ${timeDiff.toFixed(1)} hours`,
				);

				break; // Found a match, move to next withdrawal
			}
		}
	}

	logger.log(
		"transferDetection",
		`✅ Found ${transfers.length} exact amount transfers between exchanges`,
	);
	return transfers;
}

export function markTransfers(
	transactions: UnifiedTransaction[],
	transfers: TransferPair[],
): UnifiedTransaction[] {
	// Create a map for quick lookup
	const transferMap = new Map<UnifiedTransaction, string>();

	for (const transfer of transfers) {
		transferMap.set(transfer.withdrawalTx, transfer.transferId);
		transferMap.set(transfer.depositTx, transfer.transferId);
	}

	// Mark transactions as transfers
	return transactions.map((tx) => {
		const transferId = transferMap.get(tx);
		if (transferId) {
			return {
				...tx,
				type: "transfer" as const,
				transferId,
			};
		}
		return tx;
	});
}

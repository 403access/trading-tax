import type {
	PurchaseEntry,
	TaxResults,
	UnifiedTransaction,
	StakingReward,
} from "./types";
import { processBuyTransaction } from "../handlers/buy";
import { processSellTransaction } from "../handlers/sell";
import { processWithdrawalTransaction } from "../handlers/withdrawal";
import { processDepositTransaction } from "../handlers/deposit";
import { processFeeTransaction } from "../handlers/fee";
import { processTransferTransaction } from "../handlers/transfer";
import {
	processStakingRewardTransaction,
	processStakingAllocationTransaction,
} from "../handlers/staking";
import { detectTransfers, markTransfers } from "../services/transfer-detection";
import { logger, LogLevel } from "./logger";

// Main tax processing function
export async function processTransactions(
	transactions: UnifiedTransaction[],
): Promise<TaxResults> {
	// Step 1: Detect transfers between exchanges
	logger.log(
		"transferDetection",
		"🔍 Phase 1: Detecting transfers between exchanges...",
	);
	const detectedTransfers = detectTransfers(transactions);
	const processedTransactions = markTransfers(transactions, detectedTransfers);

	// Sort all transactions by date (ascending) to ensure FIFO tax compliance
	// This is critical: oldest transactions must be processed first for proper FIFO calculation
	processedTransactions.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	logger.log(
		"taxCalculations",
		"🧮 Phase 2: Processing transactions for tax calculations...",
	);
	const purchaseQueue: PurchaseEntry[] = [];
	const stakingRewards: StakingReward[] = [];
	let totalTaxableGain = 0;
	let totalExemptGain = 0; // Gains from assets held > 1 year (tax-free)
	let totalBuyEUR = 0;
	let totalSellEUR = 0;
	let totalWithdrawnBTC = 0;
	let totalWithdrawnEUR = 0;
	let totalDepositedBTC = 0;
	let totalDepositedEUR = 0;
	let totalFeeBTC = 0;
	let totalTransferredBTC = 0; // New: Track transfers
	let totalStakingIncomeEUR = 0; // New: Track staking income

	// Stats
	let buys = 0,
		sells = 0,
		deposits = 0,
		withdrawals = 0,
		fees = 0,
		transfers = 0,
		stakingRewardsCount = 0;

	// Track unique transfer IDs to count transfer pairs, not individual transactions
	const transferIds = new Set<string>();

	for (const tx of processedTransactions) {
		if (tx.type === "buy") {
			const eurAmount = processBuyTransaction(tx, purchaseQueue);
			totalBuyEUR += eurAmount;
			buys++;
		} else if (tx.type === "sell") {
			const result = processSellTransaction(tx, purchaseQueue);
			totalSellEUR += result.eurAmount;
			totalTaxableGain += result.taxableGain;
			totalExemptGain += result.exemptGain;
			sells++;
		} else if (tx.type === "withdrawal") {
			const result = processWithdrawalTransaction(tx, purchaseQueue);
			totalWithdrawnBTC += result.btcAmount;
			totalWithdrawnEUR += result.eurValue;
			totalTaxableGain += result.taxableGain;
			totalExemptGain += result.exemptGain;
			withdrawals++;
		} else if (tx.type === "deposit") {
			const result = processDepositTransaction(tx);
			totalDepositedBTC += result.depositedBTC;
			totalDepositedEUR += result.depositedEUR;
			deposits++;
		} else if (tx.type === "fee") {
			const feeBTC = processFeeTransaction(tx);
			totalFeeBTC += feeBTC;
			fees++;
		} else if (tx.type === "transfer") {
			const result = processTransferTransaction(tx);
			// Only count the transferred BTC once per transfer pair
			if (tx.transferId && !transferIds.has(tx.transferId)) {
				totalTransferredBTC += result.transferredBTC;
				transferIds.add(tx.transferId);
				transfers++;
			}
		} else if (tx.type === "staking_reward") {
			// Process staking rewards as taxable income
			const result = await processStakingRewardTransaction(tx);
			stakingRewards.push(result.stakingReward);
			totalStakingIncomeEUR += result.eurValue;
			stakingRewardsCount++;
		} else if (tx.type === "staking_allocation") {
			// Process staking allocation (affects holding period)
			processStakingAllocationTransaction(tx);
			// Note: This doesn't affect current tax calculations but would be used
			// for tracking which assets have extended holding periods
		}
	}

	return {
		totalTaxableGain,
		totalExemptGain,
		totalBuyEUR,
		totalSellEUR,
		totalWithdrawnBTC,
		totalWithdrawnEUR,
		totalDepositedBTC,
		totalDepositedEUR,
		totalFeeBTC,
		totalTransferredBTC,
		stakingRewards,
		totalStakingIncomeEUR,
		stats: {
			buys,
			sells,
			deposits,
			withdrawals,
			fees,
			transfers,
			stakingRewards: stakingRewardsCount,
		},
		remainingPurchases: purchaseQueue,
	};
}

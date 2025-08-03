import type {
	PurchaseEntry,
	TaxResults,
	UnifiedTransaction,
	StakingReward,
} from "../shared/types";
import { processBuyTransaction } from "../transaction-processing/buy";
import { processSellTransaction } from "../transaction-processing/sell";
import { processWithdrawalTransaction } from "../transaction-processing/withdrawal";
import { processDepositTransaction } from "../transaction-processing/deposit";
import { processFeeTransaction } from "../transaction-processing/fee";
import { processTransferTransaction } from "../transaction-processing/transfer";
import {
	processStakingRewardTransaction,
	processStakingAllocationTransaction,
} from "../transaction-processing/staking";
import { logger } from "../shared/logger";

// Main entry point that loads config and calculates tax
export async function processTransactions(
	transactions: UnifiedTransaction[],
): Promise<TaxResults> {
	// German tax rules are hardcoded - holding period exemption is 12 months
	return calculateTax(transactions);
}

export async function calculateTax(
	transactions: UnifiedTransaction[],
): Promise<TaxResults> {
	logger.info(`📊 Processing ${transactions.length} transactions`);

	const transferIds = new Set<string>();

	// Initialize totals
	const purchaseQueue: PurchaseEntry[] = [];
	const stakingRewards: StakingReward[] = [];
	let totalTaxableGain = 0;
	let totalExemptGain = 0; // Gains from assets held > 1 year (tax-free)
	let totalBuyEUR = 0;
	let totalSellEUR = 0;
	const tradingByYear: Record<string, { buyEUR: number; sellEUR: number }> = {}; // New: Year-based trading totals
	const totalWithdrawnAssets: Record<string, number> = {};
	let totalWithdrawnEUR = 0;
	const totalDepositedAssets: Record<string, number> = {};
	let totalDepositedEUR = 0;
	const totalFeeAssets: Record<string, number> = {};
	const totalTransferredAssets: Record<string, number> = {};
	let totalStakingIncomeEUR = 0; // New: Track staking income

	// Helper function to add to asset totals
	const addToAssetTotal = (
		totals: Record<string, number>,
		asset: string,
		amount: number,
	) => {
		if (!totals[asset]) {
			totals[asset] = 0;
		}
		totals[asset] += amount;
	};

	// Helper function to add to year-based trading totals
	const addToYearTotal = (
		date: string,
		buyEUR: number = 0,
		sellEUR: number = 0,
	) => {
		const year = new Date(date).getFullYear().toString();
		if (!tradingByYear[year]) {
			tradingByYear[year] = { buyEUR: 0, sellEUR: 0 };
		}
		tradingByYear[year].buyEUR += buyEUR;
		tradingByYear[year].sellEUR += sellEUR;
	};

	// Statistics
	let buys = 0;
	let sells = 0;
	let withdrawals = 0;
	let deposits = 0;
	let fees = 0;
	let transfers = 0;
	let stakingRewardsCount = 0;

	// Process transactions in chronological order
	for (const tx of transactions) {
		if (tx.type === "buy") {
			processBuyTransaction(tx, purchaseQueue);
			const buyAmount = Math.abs(tx.eurAmount); // Buys should be positive costs
			totalBuyEUR += buyAmount;
			addToYearTotal(tx.date, buyAmount, 0); // Track buy by year
			buys++;
		} else if (tx.type === "sell") {
			const result = processSellTransaction(tx, purchaseQueue);
			totalSellEUR += result.eurAmount;
			addToYearTotal(tx.date, 0, result.eurAmount); // Track sell by year
			totalTaxableGain += result.taxableGain;
			totalExemptGain += result.exemptGain;
			sells++;
		} else if (tx.type === "withdrawal") {
			const result = processWithdrawalTransaction(tx, purchaseQueue);
			addToAssetTotal(totalWithdrawnAssets, tx.asset, tx.assetAmount);
			// Only add EUR value if it's a valid number to prevent NaN accumulation
			if (!Number.isNaN(result.eurValue) && Number.isFinite(result.eurValue)) {
				totalWithdrawnEUR += result.eurValue;
			}
			totalTaxableGain += result.taxableGain;
			totalExemptGain += result.exemptGain;
			withdrawals++;
		} else if (tx.type === "deposit") {
			const result = processDepositTransaction(tx);
			addToAssetTotal(totalDepositedAssets, tx.asset, tx.assetAmount);
			totalDepositedEUR += result.depositedEUR;
			deposits++;
		} else if (tx.type === "fee") {
			const feeAmount = processFeeTransaction(tx);
			addToAssetTotal(totalFeeAssets, tx.asset, feeAmount);
			fees++;
		} else if (tx.type === "transfer") {
			processTransferTransaction(tx);
			// Only count the transferred assets once per transfer pair
			if (tx.transferId && !transferIds.has(tx.transferId)) {
				addToAssetTotal(totalTransferredAssets, tx.asset, tx.assetAmount);
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
		tradingByYear,
		totalWithdrawnAssets,
		totalWithdrawnEUR,
		totalDepositedAssets,
		totalDepositedEUR,
		totalFeeAssets,
		totalTransferredAssets,
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

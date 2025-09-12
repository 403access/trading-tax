import { logger } from "../../shared/logger";
import type { StakingReward, TaxResults } from "../../shared/types";
import { formatAsset, formatNumber } from "../../shared/utils";
import {
	getStakingIncomeExemption,
	shouldTrackStakingIncome,
} from "../../tax-calculations/tax-config.js";
import {
	addYearSpacing,
	formatDateWithoutYear,
	groupByYear,
} from "../utils/format-helpers";

/**
 * Displays comprehensive staking rewards analysis
 */
export function displayStakingAnalysis(results: TaxResults): void {
	if (!shouldTrackStakingIncome()) {
		return;
	}

	if (results.stakingRewards.length === 0) {
		displayNoStakingRewards();
		return;
	}

	displayStakingOverview(results);
	displayStakingDetails(results);
	displayStakingNotes();
}

/**
 * Displays message when no staking rewards are found
 */
function displayNoStakingRewards(): void {
	logger.info("");
	logger.info("=== STAKING REWARDS ANALYSIS ===");
	logger.info("No staking rewards found in transaction data.");
}

/**
 * Displays staking income overview and tax calculations
 */
function displayStakingOverview(results: TaxResults): void {
	const stakingExemption = getStakingIncomeExemption();

	logger.info("");
	logger.info("=== STAKING REWARDS ANALYSIS ===");
	logger.info(
		`Total staking income: €${formatNumber(results.totalStakingIncomeEUR)}`,
	);

	if (results.totalStakingIncomeEUR <= stakingExemption) {
		logger.info(
			`✅ Under €${formatNumber(stakingExemption)} exemption - no additional tax on staking rewards!`,
		);
	} else {
		const taxableStakingIncome =
			results.totalStakingIncomeEUR - stakingExemption;
		logger.info(`📋 Staking Income Tax (§22 Nr. 3 EStG):`);
		logger.info(`   Exemption applied: €${formatNumber(stakingExemption)}`);
		logger.info(
			`   Taxable staking income: €${formatNumber(taxableStakingIncome)}`,
		);
		logger.info(
			`   💡 This income is added to your regular income tax calculation`,
		);
	}
}

/**
 * Displays detailed breakdown of staking rewards by year
 */
function displayStakingDetails(results: TaxResults): void {
	logger.info("");
	logger.info("📊 Staking Rewards Details:");

	// Group rewards by year
	const rewardsByYear = groupByYear(results.stakingRewards);

	// Display by year in chronological order
	const years = Object.keys(rewardsByYear).sort();
	for (let i = 0; i < years.length; i++) {
		const year = years[i];
		if (!year) continue;
		const yearRewards = rewardsByYear[year];
		if (!yearRewards) continue;

		const yearTotal = yearRewards.reduce(
			(sum: number, reward: StakingReward) => sum + reward.eurValue,
			0,
		);

		logger.info(
			`   ${year} (${yearRewards.length} rewards, €${formatNumber(yearTotal)} total):`,
		);

		for (const reward of yearRewards) {
			const date = formatDateWithoutYear(reward.date);
			logger.info(
				`     ${date}: ${formatAsset(reward.amount, reward.asset)} ${reward.asset} = €${formatNumber(reward.eurValue)} (${reward.source})`,
			);
		}

		addYearSpacing(years, i);
	}
}

/**
 * Displays important notes about staking taxation
 */
function displayStakingNotes(): void {
	logger.info("");
	logger.info(
		"⚠️  IMPORTANT: Staked crypto has extended 10-year holding period!",
	);
	logger.info("💡 Staking rewards are taxable as income when received");
}

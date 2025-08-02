// Unified transaction type
export interface UnifiedTransaction {
	date: string;
	type:
		| "buy"
		| "sell"
		| "deposit"
		| "withdrawal"
		| "fee"
		| "transfer"
		| "staking_reward"
		| "staking_allocation";
	btcAmount: number; // positive for incoming, negative for outgoing
	eurAmount: number; // positive for incoming, negative for outgoing
	source: "bitcoin.de" | "kraken";
	originalData: unknown;
	transferId?: string; // Links related transfer transactions
	stakingData?: StakingData; // Additional staking information
}

// Staking-specific data
export interface StakingData {
	asset: string; // e.g., "SOL", "ETH"
	amount: number; // Amount of staked asset
	rewardAmount?: number; // For rewards, the amount earned
	isStaked?: boolean; // Whether this asset is currently staked
}

// Type definitions for different exchange formats
export type BitcoinDeRow = {
	Datum: string;
	Typ: string;
	Währung: string;
	Referenz: string;
	"BTC-Adresse": string;
	Kurs: string;
	"Einheit (Kurs)": string;
	"BTC vor Gebühr": string;
	"Menge vor Gebühr": string;
	"Einheit (Menge vor Gebühr)": string;
	"BTC nach Bitcoin.de-Gebühr": string;
	"Menge nach Bitcoin.de-Gebühr": string;
	"Einheit (Menge nach Bitcoin.de-Gebühr)": string;
	"Zu- / Abgang": string;
	Kontostand: string;
};

export type KrakenRow = {
	txid: string;
	refid: string;
	time: string;
	type: string;
	subtype: string;
	aclass: string;
	asset: string;
	wallet: string;
	amount: string;
	fee: string;
	balance: string;
};

// FIFO purchase entry for tax calculation
export interface PurchaseEntry {
	amount: number; // BTC amount
	pricePerBTC: number; // EUR per BTC
	date: string;
	remaining: number; // remaining BTC amount
	source: string;
	isStaked?: boolean; // Whether this purchase was from staked crypto
}

// Staking reward entry for income tax calculation
export interface StakingReward {
	date: string;
	asset: string; // e.g., "SOL", "ETH"
	amount: number; // Amount of reward received
	eurValue: number; // EUR value at time of receipt
	source: string; // Exchange where reward was received
}

// Tax calculation results
export interface TaxResults {
	totalTaxableGain: number;
	totalExemptGain: number;
	totalBuyEUR: number;
	totalSellEUR: number;
	totalWithdrawnBTC: number;
	totalWithdrawnEUR: number;
	totalDepositedBTC: number;
	totalDepositedEUR: number;
	totalFeeBTC: number;
	totalTransferredBTC: number; // New: Amount moved between exchanges
	stakingRewards: StakingReward[]; // New: Staking rewards received
	totalStakingIncomeEUR: number; // New: Total EUR value of staking rewards
	stats: {
		buys: number;
		sells: number;
		deposits: number;
		withdrawals: number;
		fees: number;
		transfers: number; // New: Count of transfer transactions
		stakingRewards: number; // New: Count of staking reward transactions
	};
	remainingPurchases: PurchaseEntry[];
}

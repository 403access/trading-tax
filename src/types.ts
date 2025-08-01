// Unified transaction type
export interface UnifiedTransaction {
	date: string;
	type: "buy" | "sell" | "deposit" | "withdrawal" | "fee";
	btcAmount: number; // positive for incoming, negative for outgoing
	eurAmount: number; // positive for incoming, negative for outgoing
	source: "bitcoin.de" | "kraken";
	originalData: unknown;
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
}

// Tax calculation results
export interface TaxResults {
	totalTaxableGain: number;
	totalExemptGain: number;
	totalBuyEUR: number;
	totalSellEUR: number;
	totalWithdrawnBTC: number;
	totalDepositedBTC: number;
	totalDepositedEUR: number;
	totalFeeBTC: number;
	stats: {
		buys: number;
		sells: number;
		deposits: number;
		withdrawals: number;
		fees: number;
	};
	remainingPurchases: PurchaseEntry[];
}

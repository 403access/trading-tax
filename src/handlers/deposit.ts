import type {
	BitcoinDeRow,
	KrakenRow,
	UnifiedTransaction,
} from "../core/types";

export interface DepositResult {
	depositedBTC: number;
	depositedEUR: number;
}

export function processDepositTransaction(
	tx: UnifiedTransaction,
): DepositResult {
	let depositedBTC = 0;
	let depositedEUR = 0;

	// Check the asset type from original data
	if (tx.source === "kraken") {
		const krakenData = tx.originalData as KrakenRow;
		if (krakenData.asset === "BTC") {
			depositedBTC = Math.abs(tx.btcAmount);
		} else if (krakenData.asset === "EUR") {
			depositedEUR = Math.abs(tx.eurAmount);
		}
	} else if (tx.source === "bitcoin.de") {
		const bitcoinDeData = tx.originalData as BitcoinDeRow;
		if (bitcoinDeData.Währung === "BTC") {
			depositedBTC = Math.abs(tx.btcAmount);
		} else if (bitcoinDeData.Währung === "EUR") {
			depositedEUR = Math.abs(tx.eurAmount);
		}
	} else {
		console.warn(`Unknown deposit source: ${tx.source} on ${tx.date}`);
	}

	return {
		depositedBTC,
		depositedEUR,
	};
}

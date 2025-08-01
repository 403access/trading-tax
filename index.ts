/** biome-ignore-all lint/complexity/useLiteralKeys: Easier to read */

import fs from "node:fs";
import { exit } from "node:process";
import { parse } from "csv-parse/sync";

// CSV-Datei einlesen
const content = fs.readFileSync("bitcoin-de-transactions.csv", "utf8");

// Parsen
type TransactionRow = {
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

const records = parse(content, {
	delimiter: ";",
	columns: true,
	skip_empty_lines: true,
	trim: true,
}) as TransactionRow[];

// Helfer: parseFloat mit Fallback
function toNumber(value: string): number {
	const num = parseFloat(value.replace(",", "."));
	return Number.isNaN(num) ? 0 : num;
}

// Initialisierung
let anzahlKaeufe = 0;
let anzahlVerkaeufe = 0;
let anzahlEinzahlungen = 0;
let anzahlAuszahlungen = 0;
let anzahlNetzwerkGebuehren = 0;
let kaufEUR = 0;
let verkaufEUR = 0;
let einzahlenBTC = 0;
let auszahlenBTC = 0;
let netzwerkGebuehrBTC = 0;

// FIFO-Queue für Käufe (für Steuerberechnung)
interface PurchaseEntry {
	amount: number; // BTC amount
	pricePerBTC: number; // EUR per BTC
	date: string;
	remaining: number; // remaining BTC amount
}

const purchaseQueue: PurchaseEntry[] = [];
let totalTaxableGain = 0;

for (let i = 0; i < records.length; i++) {
	const row = records[i];

	if (row === undefined) {
		console.warn(`Row ${i} is undefined, please fix ...`);
		exit(1);
	}
	const typ = row["Typ"];
	const mengeNachGebuehr = toNumber(row["Menge nach Bitcoin.de-Gebühr"]);
	const btcNachGebuehr = toNumber(row["BTC nach Bitcoin.de-Gebühr"]);
	const zuAbgang = toNumber(row["Zu- / Abgang"]);
	const datum = row["Datum"];

	if (typ === "Kauf") {
		const eurAmount = mengeNachGebuehr;
		const btcAmount = btcNachGebuehr;
		const pricePerBTC = btcAmount > 0 ? eurAmount / btcAmount : 0;

		kaufEUR += eurAmount;

		// Add to FIFO queue for tax calculation
		if (btcAmount > 0) {
			purchaseQueue.push({
				amount: btcAmount,
				pricePerBTC: pricePerBTC,
				date: datum,
				remaining: btcAmount,
			});
		}
		anzahlKaeufe++;
	} else if (typ === "Verkauf") {
		const eurAmount = mengeNachGebuehr;
		const btcAmount = Math.abs(btcNachGebuehr); // Make positive for easier calculation

		verkaufEUR += eurAmount;

		// Calculate taxable gain using FIFO
		let remainingSaleAmount = btcAmount;
		let saleGain = 0;

		while (remainingSaleAmount > 0 && purchaseQueue.length > 0) {
			const oldestPurchase = purchaseQueue[0];

			if (!oldestPurchase) break;

			if (oldestPurchase.remaining <= remainingSaleAmount) {
				// Use entire remaining amount from this purchase
				const costBasis = oldestPurchase.remaining * oldestPurchase.pricePerBTC;
				const saleValue = (oldestPurchase.remaining / btcAmount) * eurAmount;
				saleGain += saleValue - costBasis;

				remainingSaleAmount -= oldestPurchase.remaining;
				purchaseQueue.shift(); // Remove fully used purchase
			} else {
				// Partially use this purchase
				const costBasis = remainingSaleAmount * oldestPurchase.pricePerBTC;
				const saleValue = (remainingSaleAmount / btcAmount) * eurAmount;
				saleGain += saleValue - costBasis;

				oldestPurchase.remaining -= remainingSaleAmount;
				remainingSaleAmount = 0;
			}
		}

		totalTaxableGain += saleGain;
		anzahlVerkaeufe++;
	} else if (typ === "Einzahlung") {
		einzahlenBTC += zuAbgang;
		anzahlEinzahlungen++;
	} else if (typ === "Auszahlung") {
		const btcAmount = Math.abs(zuAbgang); // Make positive for easier calculation
		auszahlenBTC += zuAbgang; // Keep original negative value for tracking

		// For tax purposes, withdrawals are treated as disposals
		// We need to estimate the market value at withdrawal time
		// Since we don't have the market rate, we'll use the closest purchase price as approximation
		// This is a simplification - in reality, you'd need the market rate at withdrawal time

		if (btcAmount > 0) {
			// Calculate taxable gain using FIFO (same as sales)
			let remainingWithdrawalAmount = btcAmount;
			let withdrawalGain = 0;

			// Find the most recent purchase price as approximation for market value
			let estimatedMarketRate = 0;
			if (purchaseQueue.length > 0) {
				// Use the most recent purchase price as approximation
				estimatedMarketRate =
					purchaseQueue[purchaseQueue.length - 1]?.pricePerBTC || 0;
			}

			while (remainingWithdrawalAmount > 0 && purchaseQueue.length > 0) {
				const oldestPurchase = purchaseQueue[0];

				if (!oldestPurchase) break;

				if (oldestPurchase.remaining <= remainingWithdrawalAmount) {
					// Use entire remaining amount from this purchase
					const costBasis =
						oldestPurchase.remaining * oldestPurchase.pricePerBTC;
					const estimatedValue = oldestPurchase.remaining * estimatedMarketRate;
					withdrawalGain += estimatedValue - costBasis;

					remainingWithdrawalAmount -= oldestPurchase.remaining;
					purchaseQueue.shift(); // Remove fully used purchase
				} else {
					// Partially use this purchase
					const costBasis =
						remainingWithdrawalAmount * oldestPurchase.pricePerBTC;
					const estimatedValue =
						remainingWithdrawalAmount * estimatedMarketRate;
					withdrawalGain += estimatedValue - costBasis;

					oldestPurchase.remaining -= remainingWithdrawalAmount;
					remainingWithdrawalAmount = 0;
				}
			}

			// Add withdrawal gain to total taxable gain
			// Note: This is an approximation since we don't have the exact market rate at withdrawal
			totalTaxableGain += withdrawalGain;

			console.log(
				`⚠️  Withdrawal on ${datum}: ${formatBTC(btcAmount)} BTC (est. gain: ${formatNumber(withdrawalGain)} EUR)`,
			);
		}

		anzahlAuszahlungen++;
	} else if (typ === "Netzwerk-Gebühr") {
		netzwerkGebuehrBTC += zuAbgang;
		anzahlNetzwerkGebuehren++;
	}
}

const gewinn = verkaufEUR - kaufEUR;

// Ausgabe
// additionally format the output for better readability by adding dot (.) as thousands separator

function formatNumber(num: number): string {
	const str = num.toFixed(2);
	const [integerPart, decimalPart] = str.split(".");
	const formattedInteger = (integerPart || "0").replace(
		/\B(?=(\d{3})+(?!\d))/g,
		" ",
	);
	return `${formattedInteger}.${decimalPart || "00"}`;
}

function formatBTC(num: number): string {
	const str = num.toFixed(8);
	const [integerPart, decimalPart] = str.split(".");
	const formattedInteger = (integerPart || "0").replace(
		/\B(?=(\d{3})+(?!\d))/g,
		" ",
	);
	return `${formattedInteger}.${decimalPart || "00000000"}`;
}

console.log("=== TRADING ÜBERSICHT ===");
console.log("Gekauft (EUR):", formatNumber(kaufEUR));
console.log("Verkauft (EUR):", formatNumber(verkaufEUR));
console.log("Einfacher Gewinn (EUR):", formatNumber(gewinn));
console.log("");
console.log("=== STEUERRELEVANT (FIFO-Methode) ===");
console.log("Steuerpflichtiger Gewinn (EUR):", formatNumber(totalTaxableGain));
console.log("⚠️  WICHTIG: Auszahlungen werden als Veräußerungen behandelt!");
console.log(
	"⚠️  Marktpreise bei Auszahlungen sind geschätzt (letzter Kaufpreis)!",
);
console.log("⚠️  Für genaue Steuerberechnung echte Marktpreise verwenden!");
console.log("");
console.log("=== BITCOIN BEWEGUNGEN ===");
console.log("Ausgezahlt (BTC):", formatBTC(auszahlenBTC));
console.log("Netzwerkgebühren (BTC):", formatBTC(netzwerkGebuehrBTC));
console.log("");
console.log("=== TRANSAKTIONSSTATISTIK ===");
console.log("Anzahl Käufe:", anzahlKaeufe);
console.log("Anzahl Verkäufe:", anzahlVerkaeufe);
console.log("Anzahl Einzahlungen:", anzahlEinzahlungen);
console.log("Anzahl Auszahlungen:", anzahlAuszahlungen);
console.log("Anzahl Netzwerkgebühren:", anzahlNetzwerkGebuehren);

// Show remaining purchase queue for debugging
if (purchaseQueue.length > 0) {
	console.log("");
	console.log("=== VERBLEIBENDE KÄUFE (noch nicht verkauft) ===");
	let totalRemainingBTC = 0;
	let totalRemainingEUR = 0;
	for (const purchase of purchaseQueue) {
		totalRemainingBTC += purchase.remaining;
		totalRemainingEUR += purchase.remaining * purchase.pricePerBTC;
		console.log(
			`${purchase.date}: ${formatBTC(purchase.remaining)} BTC zu ${formatNumber(purchase.pricePerBTC)} EUR/BTC`,
		);
	}
	console.log(
		`Total verbleibend: ${formatBTC(totalRemainingBTC)} BTC (Wert: ${formatNumber(totalRemainingEUR)} EUR)`,
	);
}

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

for (let i = 0; i < records.length; i++) {
	const row = records[i];

	if (row === undefined) {
		console.warn(`Row ${i} is undefined, please fix ...`);
		exit(1);
	}
	const typ = row["Typ"];
	const mengeNachGebuehr = toNumber(row["Menge nach Bitcoin.de-Gebühr"]);
	const kurs = toNumber(row["Kurs"]);
	const zuAbgang = toNumber(row["Zu- / Abgang"]);

	if (typ === "Kauf") {
		// kaufEUR += mengeNachGebuehr * kurs;
		kaufEUR += mengeNachGebuehr; // Assuming we want to use "Menge nach Bitcoin.de-Gebühr"
		anzahlKaeufe++;
	} else if (typ === "Verkauf") {
		// verkaufEUR += mengeNachGebuehr * kurs;
		verkaufEUR += mengeNachGebuehr; // Assuming we want to use "Menge nach Bitcoin.de-Gebühr"
		anzahlVerkaeufe++;
	} else if (typ === "Einzahlung") {
		einzahlenBTC += zuAbgang;
		anzahlEinzahlungen++;
	} else if (typ === "Auszahlung") {
		auszahlenBTC += zuAbgang;
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
	return num
		.toFixed(2)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

console.log("Gekauft (EUR):", formatNumber(kaufEUR));
console.log("Verkauft (EUR):", formatNumber(verkaufEUR));
console.log("Ausgezahlt (BTC):", formatNumber(auszahlenBTC));
console.log("Netzwerkgebühren (BTC):", formatNumber(netzwerkGebuehrBTC));
console.log("Versteuerbarer Gewinn (EUR):", formatNumber(gewinn));
console.log("Anzahl Käufe:", anzahlKaeufe);
console.log("Anzahl Verkäufe:", anzahlVerkaeufe);
console.log("Anzahl Einzahlungen:", anzahlEinzahlungen);
console.log("Anzahl Auszahlungen:", anzahlAuszahlungen);
console.log("Anzahl Netzwerkgebühren:", anzahlNetzwerkGebuehren);

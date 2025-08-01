import fs from "node:fs";
import { parse } from "csv-parse/sync";

// CSV-Datei einlesen
const content = fs.readFileSync("bitcoin-de-transactionts.csv", "utf8");

// Parsen
const records = parse(content, {
	delimiter: ";",
	columns: true,
	skip_empty_lines: true,
	trim: true,
});

// Helfer: parseFloat mit Fallback
function toNumber(value: string): number {
	const num = parseFloat(value.replace(",", "."));
	return isNaN(num) ? 0 : num;
}

// Initialisierung
let kaufEUR = 0;
let verkaufEUR = 0;
let auszahlenBTC = 0;
let netzwerkGebuehrBTC = 0;

for (const row of records) {
	const typ = row["Typ"];
	const mengeVorGebuehr = toNumber(row["Menge vor Gebühr"]);
	const kurs = toNumber(row["Kurs"]);
	const zuAbgang = toNumber(row["Zu- / Abgang"]);

	if (typ === "Kauf") {
		kaufEUR += mengeVorGebuehr * kurs;
	} else if (typ === "Verkauf") {
		verkaufEUR += mengeVorGebuehr * kurs;
	} else if (typ === "Auszahlung") {
		auszahlenBTC += zuAbgang;
	} else if (typ === "Netzwerk-Gebühr") {
		netzwerkGebuehrBTC += zuAbgang;
	}
}

const gewinn = verkaufEUR - kaufEUR;

// Ausgabe
console.log("Gekauft (EUR):", kaufEUR.toFixed(2));
console.log("Verkauft (EUR):", verkaufEUR.toFixed(2));
console.log("Ausgezahlt (BTC):", auszahlenBTC.toFixed(8));
console.log("Netzwerkgebühren (BTC):", netzwerkGebuehrBTC.toFixed(8));
console.log("Versteuerbarer Gewinn (EUR):", gewinn.toFixed(2));

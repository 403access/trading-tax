import type { TaxZone, TaxZoneFormula } from "./model";

function calcFormula(zvE: number, formula: TaxZoneFormula): number {
	switch (formula.type) {
		case "zero":
			return 0;
		case "progression1": {
			const y = (zvE - formula.yOffset) / 10000;
			return (formula.k * y + formula.m) * y;
		}
		case "progression2": {
			const z = (zvE - formula.zOffset) / 10000;
			return (formula.k * z + formula.m) * z + formula.base;
		}
		case "linear":
			return formula.rate * zvE - formula.offset;
	}
}

export function calculateESt(zvE: number, zones: TaxZone[]): number {
	const zone = zones.find(
		(z) => zvE >= z.from && (z.to === undefined || zvE <= z.to),
	);
	if (!zone) throw new Error("No matching tax zone found");
	return calcFormula(zvE, zone.formula);
}

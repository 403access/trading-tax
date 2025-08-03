export type TaxZoneFormula =
	| { type: "zero" }
	| { type: "progression1"; yOffset: number; k: number; m: number }
	| {
			type: "progression2";
			zOffset: number;
			k: number;
			m: number;
			base: number;
	  }
	| { type: "linear"; rate: number; offset: number };

export interface TaxZone {
	from: number;
	to?: number;
	formula: TaxZoneFormula;
}

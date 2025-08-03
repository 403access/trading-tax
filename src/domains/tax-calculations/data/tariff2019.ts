import type { TaxZone } from "../model";

export const tariff2019: TaxZone[] = [
	{ from: 0, to: 9168, formula: { type: "zero" } },
	{
		from: 9169,
		to: 14254,
		formula: { type: "progression1", yOffset: 9168, k: 980.14, m: 1400 },
	},
	{
		from: 14255,
		to: 55960,
		formula: {
			type: "progression2",
			zOffset: 14254,
			k: 216.16,
			m: 2397,
			base: 965.58,
		},
	},
	{
		from: 55961,
		to: 265326,
		formula: { type: "linear", rate: 0.42, offset: 8780.9 },
	},
	{ from: 265327, formula: { type: "linear", rate: 0.45, offset: 16740.68 } },
];

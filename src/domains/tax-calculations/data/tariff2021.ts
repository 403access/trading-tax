import type { TaxZone } from "../model";

export const tariff2021: TaxZone[] = [
	{ from: 0, to: 9744, formula: { type: "zero" } },
	{
		from: 9745,
		to: 14753,
		formula: { type: "progression1", yOffset: 9744, k: 995.21, m: 1400 },
	},
	{
		from: 14754,
		to: 57918,
		formula: {
			type: "progression2",
			zOffset: 14753,
			k: 208.85,
			m: 2397,
			base: 950.96,
		},
	},
	{
		from: 57919,
		to: 274612,
		formula: { type: "linear", rate: 0.42, offset: 9136.63 },
	},
	{ from: 274613, formula: { type: "linear", rate: 0.45, offset: 17374.99 } },
];

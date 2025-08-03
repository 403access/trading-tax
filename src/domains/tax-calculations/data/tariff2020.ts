import type { TaxZone } from "../model";

export const tariff2020: TaxZone[] = [
	{ from: 0, to: 9408, formula: { type: "zero" } },
	{
		from: 9409,
		to: 14532,
		formula: { type: "progression1", yOffset: 9408, k: 972.87, m: 1400 },
	},
	{
		from: 14533,
		to: 57051,
		formula: {
			type: "progression2",
			zOffset: 14532,
			k: 212.02,
			m: 2397,
			base: 972.79,
		},
	},
	{
		from: 57052,
		to: 270500,
		formula: { type: "linear", rate: 0.42, offset: 8963.74 },
	},
	{ from: 270501, formula: { type: "linear", rate: 0.45, offset: 17078.74 } },
];

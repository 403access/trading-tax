import type { TaxZone } from "../model";

export const tariff2018: TaxZone[] = [
	{ from: 0, to: 9000, formula: { type: "zero" } },
	{
		from: 9001,
		to: 13996,
		formula: { type: "progression1", yOffset: 9000, k: 997.8, m: 1400 },
	},
	{
		from: 13997,
		to: 54949,
		formula: {
			type: "progression2",
			zOffset: 13996,
			k: 220.13,
			m: 2397,
			base: 948.99,
		},
	},
	{
		from: 54950,
		to: 260532,
		formula: { type: "linear", rate: 0.42, offset: 8621.75 },
	},
	{ from: 260533, formula: { type: "linear", rate: 0.45, offset: 16437.7 } },
];

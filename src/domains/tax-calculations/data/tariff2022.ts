import type { TaxZone } from "../model";

export const tariff2022: TaxZone[] = [
	{ from: 0, to: 10347, formula: { type: "zero" } },
	{
		from: 10348,
		to: 14926,
		formula: { type: "progression1", yOffset: 10347, k: 1088.67, m: 1400 },
	},
	{
		from: 14927,
		to: 58596,
		formula: {
			type: "progression2",
			zOffset: 14926,
			k: 206.43,
			m: 2397,
			base: 869.32,
		},
	},
	{
		from: 58597,
		to: 277825,
		formula: { type: "linear", rate: 0.42, offset: 9336.45 },
	},
	{ from: 277826, formula: { type: "linear", rate: 0.45, offset: 17671.2 } },
];

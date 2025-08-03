import type { TaxZone } from "../model";

export const tariff2016: TaxZone[] = [
	{ from: 0, to: 8652, formula: { type: "zero" } },
	{
		from: 8653,
		to: 13669,
		formula: { type: "progression1", yOffset: 8652, k: 993.62, m: 1400 },
	},
	{
		from: 13670,
		to: 53665,
		formula: {
			type: "progression2",
			zOffset: 13669,
			k: 225.4,
			m: 2397,
			base: 952.48,
		},
	},
	{
		from: 53666,
		to: 254446,
		formula: { type: "linear", rate: 0.42, offset: 8394.14 },
	},
	{ from: 254447, formula: { type: "linear", rate: 0.45, offset: 16027.52 } },
];

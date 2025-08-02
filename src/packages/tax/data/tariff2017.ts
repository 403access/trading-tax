import type { TaxZone } from "../model";

export const tariff2017: TaxZone[] = [
	{ from: 0, to: 8820, formula: { type: "zero" } },
	{
		from: 8821,
		to: 13769,
		formula: { type: "progression1", yOffset: 8820, k: 1007.27, m: 1400 },
	},
	{
		from: 13770,
		to: 54057,
		formula: {
			type: "progression2",
			zOffset: 13769,
			k: 223.76,
			m: 2397,
			base: 939.57,
		},
	},
	{
		from: 54058,
		to: 256303,
		formula: { type: "linear", rate: 0.42, offset: 8475.44 },
	},
	{ from: 256304, formula: { type: "linear", rate: 0.45, offset: 16164.53 } },
];

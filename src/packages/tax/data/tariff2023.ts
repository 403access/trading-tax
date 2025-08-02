import type { TaxZone } from "../model";

export const tariff2023: TaxZone[] = [
	{ from: 0, to: 10908, formula: { type: "zero" } },
	{
		from: 10909,
		to: 15999,
		formula: { type: "progression1", yOffset: 10908, k: 979.18, m: 1400 },
	},
	{
		from: 16000,
		to: 62809,
		formula: {
			type: "progression2",
			zOffset: 15999,
			k: 192.59,
			m: 2397,
			base: 966.53,
		},
	},
	{
		from: 62810,
		to: 277825,
		formula: { type: "linear", rate: 0.42, offset: 9729.08 },
	},
	{ from: 277826, formula: { type: "linear", rate: 0.45, offset: 18307.73 } },
];

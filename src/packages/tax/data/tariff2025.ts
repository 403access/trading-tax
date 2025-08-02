import type { TaxZone } from "../model";

export const tariff2025: TaxZone[] = [
	{
		from: 0,
		to: 12096,
		formula: { type: "zero" },
	},
	{
		from: 12097,
		to: 17443,
		formula: {
			type: "progression1",
			yOffset: 12096,
			k: 932.3,
			m: 1400,
		},
	},
	{
		from: 17444,
		to: 68480,
		formula: {
			type: "progression2",
			zOffset: 17443,
			k: 176.64,
			m: 2397,
			base: 1015.13,
		},
	},
	{
		from: 68481,
		to: 277825,
		formula: {
			type: "linear",
			rate: 0.42,
			offset: 10911.92,
		},
	},
	{
		from: 277826,
		formula: {
			type: "linear",
			rate: 0.45,
			offset: 19246.67,
		},
	},
];

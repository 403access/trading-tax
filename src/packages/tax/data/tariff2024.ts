import type { TaxZone } from "../model";

export const tariff2024: TaxZone[] = [
	{
		from: 0,
		to: 11784,
		formula: { type: "zero" },
	},
	{
		from: 11785,
		to: 17005,
		formula: {
			type: "progression1",
			yOffset: 11784,
			k: 954.8,
			m: 1400,
		},
	},
	{
		from: 17006,
		to: 66760,
		formula: {
			type: "progression2",
			zOffset: 17005,
			k: 181.19,
			m: 2397,
			base: 991.21,
		},
	},
	{
		from: 66761,
		to: 277825,
		formula: {
			type: "linear",
			rate: 0.42,
			offset: 10636.31,
		},
	},
	{
		from: 277826,
		formula: {
			type: "linear",
			rate: 0.45,
			offset: 18971.06,
		},
	},
];

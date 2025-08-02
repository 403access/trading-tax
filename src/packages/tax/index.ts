import { calculateESt } from "./calculate";
import { tariff2016 } from "./data/tariff2016";
import { tariff2017 } from "./data/tariff2017";
import { tariff2018 } from "./data/tariff2018";
import { tariff2019 } from "./data/tariff2019";
import { tariff2020 } from "./data/tariff2020";
import { tariff2021 } from "./data/tariff2021";
import { tariff2022 } from "./data/tariff2022";
import { tariff2023 } from "./data/tariff2023";
import { tariff2024 } from "./data/tariff2024";
import { tariff2025 } from "./data/tariff2025";

export function est2016(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2016));
}
export function est2017(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2017));
}

export function est2018(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2018));
}

export function est2019(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2019));
}

export function est2020(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2020));
}

export function est2021(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2021));
}

export function est2022(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2022));
}

export function est2023(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2023));
}

export function est2024(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2024));
}

export function est2025(zvE: number): number {
	return Math.floor(calculateESt(zvE, tariff2025));
}

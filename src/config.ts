import fs from "node:fs";
import path from "node:path";

interface DataSourcesConfig {
	transactions: {
		[exchange: string]: {
			[file: string]: string;
		};
	};
	historicalPrices: {
		[key: string]: string;
	};
}

interface TaxRulesConfig {
	germany: {
		fifoMethod: boolean;
		exemptionPeriod: {
			years: number;
			description: string;
		};
		taxableEvents: string[];
		exemptEvents: string[];
	};
}

interface ExchangesConfig {
	[exchange: string]: {
		name: string;
		format: string;
		delimiter: string;
		columns: {
			[key: string]: string;
		};
		typeMapping: {
			[key: string]: string;
		};
	};
}

export function loadDataSources(): DataSourcesConfig {
	const configPath = path.join(process.cwd(), "config", "data-sources.json");
	const content = fs.readFileSync(configPath, "utf8");
	return JSON.parse(content);
}

export function loadTaxRules(): TaxRulesConfig {
	const configPath = path.join(process.cwd(), "config", "tax-rules.json");
	const content = fs.readFileSync(configPath, "utf8");
	return JSON.parse(content);
}

export function loadExchangeConfig(): ExchangesConfig {
	const configPath = path.join(process.cwd(), "config", "exchanges.json");
	const content = fs.readFileSync(configPath, "utf8");
	return JSON.parse(content);
}

export type { DataSourcesConfig, TaxRulesConfig, ExchangesConfig };

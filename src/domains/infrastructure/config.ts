import fs from "node:fs";
import path from "node:path";

export interface DataSourcesConfig {
	transactions: {
		[exchange: string]: {
			[file: string]: string;
		};
	};
	historicalPrices: {
		[key: string]: string;
	};
}

export function loadDataSources(): DataSourcesConfig {
	const configPath = path.join(process.cwd(), "config", "data-sources.json");
	const content = fs.readFileSync(configPath, "utf8");
	return JSON.parse(content);
}

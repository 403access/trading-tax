import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runApplication } from "./src/app";
import { logger } from "./src/domains/shared";

async function main() {
	try {
		const output = await runApplication();
		// Persist last run output for serving in UI
		const outDir = join(process.cwd(), "data", "output");
		try {
			mkdirSync(outDir, { recursive: true });
		} catch {}
		const outPath = join(outDir, "last-run.json");
		writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");

		if (output.error) {
			process.exitCode = 1;
		}
	} catch (error) {
		logger.error("❌ Application error:", error);
		process.exit(1);
	}
}

main();

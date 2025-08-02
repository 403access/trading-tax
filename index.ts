import { runApplication } from "./src/app";
import { logger } from "./src/core/logger";

async function main() {
	try {
		await runApplication();
	} catch (error) {
		logger.error("❌ Application error:", error);
		process.exit(1);
	}
}

main();

import { runApplication } from "./src/app";
import { logger } from "./src/domains/shared";

async function main() {
	try {
		await runApplication();
	} catch (error) {
		logger.error("❌ Application error:", error);
		process.exit(1);
	}
}

main();

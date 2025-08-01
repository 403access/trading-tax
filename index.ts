import { exit } from "node:process";
import { runApplication } from "./src/app";

// Main execution
function main() {
	try {
		runApplication();
	} catch (error) {
		console.error("❌ Application error:", error);
		exit(1);
	}
}

main();

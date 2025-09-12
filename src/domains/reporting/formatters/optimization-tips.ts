import { logger } from "../../shared/logger";
import type { TaxResults } from "../../shared/types";
import {
	getAnnualExemption,
	shouldShowOptimizationTips,
} from "../../tax-calculations/tax-config.js";

/**
 * Displays tax optimization tips when appropriate
 */
export function displayOptimizationTips(results: TaxResults): void {
	const annualExemption = getAnnualExemption();

	if (
		results.totalTaxableGain > annualExemption &&
		shouldShowOptimizationTips()
	) {
		logger.info("💡 Tax Optimization Tips:");
		logger.info("   • Hold crypto >1 year for complete tax exemption");
		logger.info("   • Consider timing of sales to manage annual gains");
		logger.info("   • December→January sales are fully taxable (short-term)");
		logger.info("   • Tax rate depends on your total annual income");
		logger.info("");
	}
}

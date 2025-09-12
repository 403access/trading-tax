import type { TaxResults } from "#/domains/shared";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/frontend/components/ui/table";
import { Section } from "./Section";

function formatEUR(n: number) {
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(n);
}

export function YearDetails({
	year,
	results,
}: {
	year: string;
	results: TaxResults;
}) {
	const byYear = results.tradingByYear[year];
	return (
		<div className="space-y-6">
			<Section title={`Trading in ${year}`}>
				<div className="rounded border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="text-right">Buy EUR</TableHead>
								<TableHead className="text-right">Sell EUR</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="text-right">
									{formatEUR(byYear?.buyEUR ?? 0)}
								</TableCell>
								<TableCell className="text-right">
									{formatEUR(byYear?.sellEUR ?? 0)}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</Section>

			{/* Future: add realized gains per year, staking income per year, etc. */}
		</div>
	);
}

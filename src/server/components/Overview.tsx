import type { TaxResults } from "#/domains/shared";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/frontend/components/ui/table";
import { AssetTable } from "./AssetTable";
import { Section } from "./Section";
import { Totals } from "./Totals";

function formatEUR(n: number) {
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(n);
}

export function Overview({ results }: { results: TaxResults }) {
	return (
		<div className="space-y-6">
			<Section title="Totals">
				<Totals r={results} />
			</Section>

			<Section title="Trading by Year">
				<div className="rounded border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Year</TableHead>
								<TableHead className="text-right">Buy EUR</TableHead>
								<TableHead className="text-right">Sell EUR</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Object.entries(results.tradingByYear).map(([year, v]) => (
								<TableRow key={year}>
									<TableCell>{year}</TableCell>
									<TableCell className="text-right">
										{formatEUR(v.buyEUR)}
									</TableCell>
									<TableCell className="text-right">
										{formatEUR(v.sellEUR)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Section>

			<Section title="Assets">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<AssetTable
						title="Deposited assets"
						records={results.totalDepositedAssets}
					/>
					<AssetTable
						title="Withdrawn assets"
						records={results.totalWithdrawnAssets}
					/>
					<AssetTable title="Fee assets" records={results.totalFeeAssets} />
					<AssetTable
						title="Transferred assets"
						records={results.totalTransferredAssets}
					/>
				</div>
			</Section>
		</div>
	);
}

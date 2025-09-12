import { useEffect, useState } from "react";
import type { RunOutput } from "#/domains/shared";
import { Button } from "#/frontend/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/frontend/components/ui/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/frontend/components/ui/tabs";
import { AssetTable } from "./components/AssetTable";
import { Logs } from "./components/Logs";
import { Section } from "./components/Section";
import { Totals } from "./components/Totals";

type UIData = RunOutput;

function formatEUR(n: number) {
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(n);
}

export function App() {
	const [data, setData] = useState<UIData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/run-output");
				if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
				const json = (await res.json()) as UIData;
				if (!cancelled) setData(json);
			} catch (e) {
				if (!cancelled) setError(e instanceof Error ? e.message : String(e));
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		run();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Trading Tax Results</h1>
				<Button onClick={() => location.reload()}>Refresh</Button>
			</div>

			{loading && (
				<div>Loading latest CLI output… Run "bun run cli" if empty.</div>
			)}
			{error && <div className="text-red-500">{error}</div>}

			{data && (
				<Tabs defaultValue="results">
					<TabsList>
						<TabsTrigger value="results">Results</TabsTrigger>
						<TabsTrigger value="logs">Logs</TabsTrigger>
						{data.error && <TabsTrigger value="error">Error</TabsTrigger>}
					</TabsList>
					<TabsContent value="results">
						{data.results ? (
							<div className="space-y-6">
								<Section title="Totals">
									<Totals r={data.results} />
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
												{Object.entries(data.results.tradingByYear).map(
													([year, v]) => (
														<TableRow key={year}>
															<TableCell>{year}</TableCell>
															<TableCell className="text-right">
																{formatEUR(v.buyEUR)}
															</TableCell>
															<TableCell className="text-right">
																{formatEUR(v.sellEUR)}
															</TableCell>
														</TableRow>
													),
												)}
											</TableBody>
										</Table>
									</div>
								</Section>

								<Section title="Assets">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<AssetTable
											title="Deposited assets"
											records={data.results.totalDepositedAssets}
										/>
										<AssetTable
											title="Withdrawn assets"
											records={data.results.totalWithdrawnAssets}
										/>
										<AssetTable
											title="Fee assets"
											records={data.results.totalFeeAssets}
										/>
										<AssetTable
											title="Transferred assets"
											records={data.results.totalTransferredAssets}
										/>
									</div>
								</Section>
							</div>
						) : (
							<div>No results available.</div>
						)}
					</TabsContent>
					<TabsContent value="logs">
						<Logs data={data} />
					</TabsContent>
					{data.error && (
						<TabsContent value="error">
							<div className="text-red-500">{data.error}</div>
						</TabsContent>
					)}
				</Tabs>
			)}
		</div>
	);
}

import { useEffect, useState } from "react";
import type { RunOutput } from "#/domains/shared";
import { Button } from "#/frontend/components/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/frontend/components/ui/tabs";
import { Logs } from "./components/Logs";
import { ResultsTabs } from "./components/ResultsTabs";

type UIData = RunOutput;

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
				if (!cancelled) {
					setData(json);
				}
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
							<ResultsTabs results={data.results} />
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

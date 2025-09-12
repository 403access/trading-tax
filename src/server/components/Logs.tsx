import { useMemo, useState } from "react";
import type { RunOutput } from "#/domains/shared";
import { Button } from "#/frontend/components/ui/button";
import { Input } from "#/frontend/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/frontend/components/ui/table";

type UIData = RunOutput;

export function Logs({ data }: { data: UIData | null }) {
	const [q, setQ] = useState("");
	const logs = useMemo(() => {
		const items = data?.logs ?? [];
		if (!q) return items;
		const L = q.toLowerCase();
		return items.filter(
			(l) =>
				l.message.toLowerCase().includes(L) ||
				l.feature?.toLowerCase().includes(L) ||
				l.level.toLowerCase().includes(L),
		);
	}, [data, q]);
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Input
					placeholder="Filter logs..."
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
				<Button variant="outline" onClick={() => setQ("")}>
					Clear
				</Button>
			</div>
			<div className="rounded border max-h-[50vh] overflow-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[120px]">Time</TableHead>
							<TableHead className="w-[90px]">Level</TableHead>
							<TableHead className="w-[150px]">Feature</TableHead>
							<TableHead>Message</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{logs.map((l, i) => (
							<TableRow key={`${l.timestamp}-${i}`}>
								<TableCell className="text-muted-foreground">
									{new Date(l.timestamp).toLocaleTimeString()}
								</TableCell>
								<TableCell>
									<span
										className={
											l.level === "ERROR"
												? "text-red-500"
												: l.level === "WARN"
													? "text-yellow-500"
													: l.level === "INFO"
														? "text-cyan-500"
														: "text-slate-400"
										}
									>
										{l.level}
									</span>
								</TableCell>
								<TableCell>{l.feature ?? "-"}</TableCell>
								<TableCell className="whitespace-pre-wrap break-words">
									{l.message}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

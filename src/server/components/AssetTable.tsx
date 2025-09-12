import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/frontend/components/ui/table";

export function AssetTable({
	title,
	records,
}: {
	title: string;
	records: Record<string, number>;
}) {
	const entries = Object.entries(records);
	if (!entries.length) return null;
	return (
		<div className="rounded border">
			<Table>
				<TableCaption>{title}</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Asset</TableHead>
						<TableHead className="text-right">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{entries.map(([asset, amount]) => (
						<TableRow key={asset}>
							<TableCell>{asset}</TableCell>
							<TableCell className="text-right">{amount}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

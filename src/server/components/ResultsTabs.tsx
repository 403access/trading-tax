import type { TaxResults } from "#/domains/shared";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/frontend/components/ui/tabs";
import { Overview } from "./Overview";
import { YearDetails } from "./YearDetails";

export function ResultsTabs({ results }: { results: TaxResults }) {
	const years = Object.keys(results.tradingByYear).sort();
	return (
		<Tabs defaultValue="overview">
			<TabsList className="flex flex-wrap gap-2">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				{years.map((year) => (
					<TabsTrigger key={year} value={year}>
						{year}
					</TabsTrigger>
				))}
			</TabsList>

			<TabsContent value="overview">
				<Overview results={results} />
			</TabsContent>
			{years.map((year) => (
				<TabsContent key={year} value={year}>
					<YearDetails year={year} results={results} />
				</TabsContent>
			))}
		</Tabs>
	);
}

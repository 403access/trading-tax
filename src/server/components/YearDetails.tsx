import type { TaxResults, UnifiedTransaction } from "#/domains/shared";
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
	console.log("YearDetails year:", year);
	console.log("YearDetails results:", results);

	const byYear = results.tradingByYear[year];
	// const yearTx = (transactions ?? []).filter(
	// 	(t) => new Date(t.date).getFullYear().toString() === year,
	// );
	// const trades = yearTx.filter((t) => t.type === "buy" || t.type === "sell");
	// const withdrawals = yearTx.filter((t) => t.type === "withdrawal");
	// const deposits = yearTx.filter((t) => t.type === "deposit");
	// const fees = yearTx.filter((t) => t.type === "fee");
	// const transfers = yearTx.filter((t) => t.type === "transfer");
	const staking = results.stakingRewards.filter((t) => t.date.startsWith(year));

	const remainingPurchases = results.remainingPurchases.filter((t) =>
		t.date.startsWith(year),
	);

	const addressFromTx = (t: UnifiedTransaction): string | undefined => {
		const data = t.originalData;
		// Kraken withdrawal: look for refid/txid if type is withdrawal
		if (t.source === "kraken") {
			if (isKrakenRow(data) && data.type === "withdrawal") {
				return data.refid || data.txid || undefined;
			}
		}
		// Bitcoin.de: the CSV row carries a BTC address field
		if (t.source === "bitcoin.de") {
			if (isBitcoinDeRow(data) && typeof data["BTC-Adresse"] === "string") {
				return data["BTC-Adresse"];
			}
		}
		return undefined;
	};

	function isKrakenRow(
		x: unknown,
	): x is { type: string; txid?: string; refid?: string } {
		return (
			typeof x === "object" &&
			x !== null &&
			"type" in x &&
			("txid" in x || "refid" in x)
		);
	}
	function isBitcoinDeRow(x: unknown): x is { [k: string]: unknown } {
		return typeof x === "object" && x !== null && "BTC-Adresse" in x;
	}

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

			{/* <Section title="Trades">
				<div className="rounded border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Asset</TableHead>
								<TableHead className="text-right">Asset amount</TableHead>
								<TableHead className="text-right">EUR amount</TableHead>
								<TableHead>Source</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{trades.map((t, idx) => (
								<TableRow key={`${t.date}-${t.asset}-${idx}`}>
									<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
									<TableCell className="uppercase">{t.type}</TableCell>
									<TableCell>{t.asset}</TableCell>
									<TableCell className="text-right">{t.assetAmount}</TableCell>
									<TableCell className="text-right">
										{formatEUR(t.eurAmount)}
									</TableCell>
									<TableCell className="uppercase">{t.source}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Section>

			<Section title="Withdrawals">
				<div className="rounded border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Asset</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead>Address / Ref</TableHead>
								<TableHead>Source</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{withdrawals.map((t, idx) => (
								<TableRow key={`${t.date}-${t.asset}-wd-${idx}`}>
									<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
									<TableCell>{t.asset}</TableCell>
									<TableCell className="text-right">{t.assetAmount}</TableCell>
									<TableCell className="font-mono text-xs break-all">
										{addressFromTx(t) ?? "-"}
									</TableCell>
									<TableCell className="uppercase">{t.source}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Section>

			<Section title="Deposits">
				<div className="rounded border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Asset</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead>Source</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{deposits.map((t, idx) => (
								<TableRow key={`${t.date}-${t.asset}-dp-${idx}`}>
									<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
									<TableCell>{t.asset}</TableCell>
									<TableCell className="text-right">{t.assetAmount}</TableCell>
									<TableCell className="uppercase">{t.source}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Section>

			<Section title="Fees">
				<div className="rounded border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Asset</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead>Source</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{fees.map((t, idx) => (
								<TableRow key={`${t.date}-${t.asset}-fee-${idx}`}>
									<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
									<TableCell>{t.asset}</TableCell>
									<TableCell className="text-right">{t.assetAmount}</TableCell>
									<TableCell className="uppercase">{t.source}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Section>

			{transfers.length > 0 && (
				<Section title="Transfers">
					<div className="rounded border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Asset</TableHead>
									<TableHead className="text-right">Amount</TableHead>
									<TableHead>Transfer ID</TableHead>
									<TableHead>Source</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transfers.map((t, idx) => (
									<TableRow key={`${t.date}-${t.asset}-tr-${idx}`}>
										<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
										<TableCell>{t.asset}</TableCell>
										<TableCell className="text-right">
											{t.assetAmount}
										</TableCell>
										<TableCell className="font-mono text-xs">
											{t.transferId ?? "-"}
										</TableCell>
										<TableCell className="uppercase">{t.source}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Section>
			)}
            */}

			{remainingPurchases.length > 0 && (
				<Section title="Remaining Purchases">
					<div className="rounded border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Asset</TableHead>
									<TableHead className="text-right">Amount</TableHead>
									<TableHead className="text-right">EUR Value</TableHead>
									<TableHead>Source</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{remainingPurchases.map((t, idx) => (
									<TableRow key={`${t.date}-${t.asset}-rp-${idx}`}>
										<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
										<TableCell>{t.asset}</TableCell>
										<TableCell className="text-right">{t.amount}</TableCell>
										<TableCell className="text-right">
											{formatEUR(t.pricePerAsset)}
										</TableCell>
										<TableCell className="text-right">{t.isStaked}</TableCell>
										<TableCell className="text-right">{t.remaining}</TableCell>
										<TableCell className="uppercase">{t.source}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Section>
			)}

			{staking.length > 0 && (
				<Section title="Staking">
					<div className="rounded border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Asset</TableHead>
									<TableHead className="text-right">Amount</TableHead>
									<TableHead>Source</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{staking.map((t, idx) => (
									<TableRow key={`${t.date}-${t.asset}-stk-${idx}`}>
										<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
										<TableCell>{t.asset}</TableCell>
										<TableCell className="text-right">{t.amount}</TableCell>
										<TableCell>{t.eurValue}</TableCell>
										<TableCell className="uppercase">{t.source}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Section>
			)}

			{/* Future: add realized gains per year, staking income per year, etc. */}
		</div>
	);
}

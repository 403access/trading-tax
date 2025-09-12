import type { TaxResults } from "#/domains/shared";
import { KeyValue } from "./KeyValue";

function formatEUR(n: number) {
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(n);
}

export function Totals({ r }: { r: TaxResults }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div className="rounded border p-3">
				<KeyValue
					label="Total taxable gain"
					value={formatEUR(r.totalTaxableGain)}
				/>
				<KeyValue
					label="Total exempt gain"
					value={formatEUR(r.totalExemptGain)}
				/>
				<KeyValue label="Total buy EUR" value={formatEUR(r.totalBuyEUR)} />
				<KeyValue label="Total sell EUR" value={formatEUR(r.totalSellEUR)} />
				<KeyValue
					label="Total deposited EUR"
					value={formatEUR(r.totalDepositedEUR)}
				/>
				<KeyValue
					label="Total withdrawn EUR"
					value={formatEUR(r.totalWithdrawnEUR)}
				/>
				<KeyValue
					label="Total staking income"
					value={formatEUR(r.totalStakingIncomeEUR)}
				/>
			</div>
			<div className="rounded border p-3">
				<div className="font-medium mb-2">Transaction counts</div>
				<KeyValue label="Buys" value={r.stats.buys} />
				<KeyValue label="Sells" value={r.stats.sells} />
				<KeyValue label="Deposits" value={r.stats.deposits} />
				<KeyValue label="Withdrawals" value={r.stats.withdrawals} />
				<KeyValue label="Fees" value={r.stats.fees} />
				<KeyValue label="Transfers" value={r.stats.transfers} />
				<KeyValue label="Staking rewards" value={r.stats.stakingRewards} />
			</div>
		</div>
	);
}

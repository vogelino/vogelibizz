import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpensesOverviewValue({
	label,
	value,
	loading,
	emphasized = false,
}: {
	label: string;
	value: string;
	loading: boolean;
	emphasized?: boolean;
}) {
	return (
		<div className="flex flex-col">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span className="text-lg">
				{loading ? (
					<Skeleton
						className={
							emphasized
								? "mt-1.5 mb-1 h-6 w-24 bg-accent-foreground/20"
								: "h-6 w-24"
						}
					/>
				) : (
					value
				)}
			</span>
		</div>
	);
}

export function ExpensesOverviewPanelLayout({
	children,
	aside,
}: {
	children: ReactNode;
	aside?: ReactNode;
}) {
	return (
		<div className="sticky left-0 px-6 md:px-10">
			<div className="my-4 bg-muted p-4">
				<div className="flex flex-wrap items-start justify-between gap-6">
					<div className="flex flex-wrap gap-6">{children}</div>
					{aside ? <div className="flex items-start gap-4">{aside}</div> : null}
				</div>
			</div>
		</div>
	);
}

export function ExpensesOverviewPanel({
	loading,
	filteredTotal,
	configuredTotal,
	livingCost,
	observedAverage,
	categoryChart,
	typeChart,
}: {
	loading: boolean;
	filteredTotal: string | null;
	configuredTotal: string;
	livingCost: string;
	observedAverage: string;
	categoryChart: ReactNode;
	typeChart: ReactNode;
}) {
	return (
		<ExpensesOverviewPanelLayout
			aside={
				<>
					{categoryChart}
					{typeChart}
				</>
			}
		>
			{filteredTotal !== null ? (
				<ExpensesOverviewValue
					label="Filtered total"
					value={filteredTotal}
					loading={loading}
					emphasized
				/>
			) : null}
			<ExpensesOverviewValue
				label="Configured recurring total"
				value={configuredTotal}
				loading={loading}
				emphasized
			/>
			<ExpensesOverviewValue
				label="Living-cost estimate"
				value={livingCost}
				loading={loading}
			/>
			<ExpensesOverviewValue
				label="Observed monthly average"
				value={observedAverage}
				loading={loading}
			/>
		</ExpensesOverviewPanelLayout>
	);
}

import { useMemo } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import {
	DashboardSection,
	DashboardSectionMessage,
} from "../dashboard-section";
import { getRecurringStatus } from "./getRecurringStatus";

type DashboardRecurringStatusProps = {
	dashboard: ExpenseDashboard;
	view: ExpenseDashboardComparisonView;
};

export function DashboardRecurringStatus({
	dashboard,
	view,
}: DashboardRecurringStatusProps) {
	const currentTitle = formatExpenseHistoryMonth(view.current.month);
	const recurringRows = useMemo(
		() => view.recurringComparisons.slice(0, 6),
		[view.recurringComparisons],
	);

	return (
		<DashboardSection
			title="Upcoming bills"
			description={`Bills paid in ${currentTitle} and bills that may still be coming`}
		>
			{recurringRows.length === 0 ? (
				<DashboardSectionMessage>
					No recurring expenses configured.
				</DashboardSectionMessage>
			) : (
				<ul className="divide-y divide-border">
					{recurringRows.map((expense) => {
						const status = getRecurringStatus({
							expense,
							currentTitle,
							currency: dashboard.currency,
						});
						return (
							<li
								key={expense.expenseId}
								className="flex items-center justify-between gap-4 py-3 first:pt-0"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{expense.name}</p>
									<p className="mt-0.5 text-xs text-muted-foreground">
										{status}
									</p>
								</div>
								<p className="shrink-0 text-sm tabular-nums">
									{formatCurrency(expense.currentActual, dashboard.currency)}
									{expense.expectation === "due" ||
									expense.expectation === "one-time" ? (
										<span className="text-muted-foreground">
											{" "}
											/{" "}
											{formatCurrency(
												expense.expectedThisMonth,
												dashboard.currency,
											)}
										</span>
									) : null}
								</p>
							</li>
						);
					})}
				</ul>
			)}
		</DashboardSection>
	);
}

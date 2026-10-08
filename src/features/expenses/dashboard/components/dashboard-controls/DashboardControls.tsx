import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import type {
	ExpenseDashboardComparison,
	ExpenseDashboardComparisonView,
} from "../../expenseDashboardComparison";

type ComparisonOption = {
	value: ExpenseDashboardComparison;
	label: string;
};

type DashboardControlsProps = {
	dashboard: ExpenseDashboard;
	view: ExpenseDashboardComparisonView;
	comparison: ExpenseDashboardComparison;
	onMonthChange: (month: string | null) => void;
	onComparisonChange: (comparison: ExpenseDashboardComparison) => void;
};

export function DashboardControls({
	dashboard,
	view,
	comparison,
	onMonthChange,
	onComparisonChange,
}: DashboardControlsProps) {
	const selectedYear = view.current.month.slice(0, 4);
	const comparisonOptions: ComparisonOption[] = [
		{
			value: "current-year",
			label: `Other months in ${selectedYear} (average)`,
		},
		{ value: "previous", label: "Previous month" },
		{ value: "3m", label: "Previous 3-month average" },
		{ value: "6m", label: "Previous 6-month average" },
		{ value: "12m", label: "Previous 12-month average" },
		{ value: "year", label: "Same month last year" },
	];
	const monthOptions = useMemo(
		() =>
			dashboard.months.map(({ month }) => ({
				value: month,
				label: formatExpenseHistoryMonth(month),
			})),
		[dashboard.months],
	);

	return (
		<div className="flex flex-wrap items-end justify-between gap-5">
			<div>
				<p className="text-sm text-muted-foreground">Managing expenses for</p>
				<h2 className="sr-only">{view.current.month}</h2>
				<div className="mt-1 flex items-center">
					<Button
						disabled={!view.previousMonth}
						onClick={() => onMonthChange(view.previousMonth)}
						aria-label="Review previous imported month"
						size="icon"
						variant="outline"
						className="size-12 grow border-r-0"
					>
						<ChevronLeft className="size-5" />
					</Button>
					<div className="grid">
						{monthOptions.map((option) => (
							<span
								key={option.value}
								aria-hidden="true"
								className="invisible col-start-1 row-start-1 flex h-12 items-center whitespace-nowrap pl-3 pr-4 text-xl font-semibold"
							>
								{option.label}
								<span className="ml-2 size-4" />
							</span>
						))}
						<Combobox
							options={monthOptions}
							value={view.current.month}
							onChange={onMonthChange}
							className="col-start-1 row-start-1 h-12 w-full text-xl font-semibold"
						/>
					</div>
					<Button
						disabled={!view.nextMonth}
						onClick={() => onMonthChange(view.nextMonth)}
						aria-label="Review next imported month"
						size="icon"
						variant="outline"
						className="size-12 grow border-l-0"
					>
						<ChevronRight className="size-5" />
					</Button>
				</div>
			</div>
			<label className="grid gap-1" htmlFor="compare-with">
				<span className="text-sm text-muted-foreground">Compare with</span>
				<Combobox
					id="compare-with"
					options={comparisonOptions}
					value={comparison}
					onChange={(value) =>
						onComparisonChange(value as ExpenseDashboardComparison)
					}
				/>
			</label>
		</div>
	);
}

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { IconBadge } from "@/components/ui/icon-badge";
import { InlineCombobox, InlineInput } from "@/components/ui/inline-edit";
import {
	type CurrencyIdType,
	type ExpenseType,
	expenseCategoryEnum,
	expenseTypeEnum,
} from "@/db/schema";
import { mapTypeToIcon, typeToColorClass } from "@/utility/expensesIconUtil";
import { formatCurrency } from "@/utility/formatUtil";
import {
	type ExpenseOverviewRow,
	getRealMonthlyAverageStatus,
	type RealMonthlyAverageStatus,
} from "./expenseOverviewRows";

const columnHelper = createColumnHelper<ExpenseOverviewRow>();

function formatAvailableCurrency(
	value: number | null,
	currency: CurrencyIdType,
) {
	return value === null ? "–" : formatCurrency(value, currency);
}

const realMonthlyAverageIndicators: Record<
	Exclude<RealMonthlyAverageStatus, "unavailable">,
	{ icon: typeof ArrowUp; label: string; className: string }
> = {
	overpaid: {
		icon: ArrowUp,
		label: "Overpaid compared with expected monthly amount",
		className: "text-red-500",
	},
	underpaid: {
		icon: ArrowDown,
		label: "Underpaid compared with expected monthly amount",
		className: "text-red-500",
	},
	"as-expected": {
		icon: Check,
		label: "Matches expected monthly amount",
		className: "text-green-600",
	},
};

export function getExpensesTableColumns(
	targetCurrency: CurrencyIdType,
	onEdit: (
		row: Extract<ExpenseOverviewRow, { kind: "recurring" }>,
		change: Partial<ExpenseType>,
	) => void,
) {
	return [
		columnHelper.accessor("name", {
			id: "name",
			size: 1000,
			header: "Name",
			cell: ({ getValue, row }) => {
				if (row.original.kind === "other") {
					return (
						<span className="text-base whitespace-nowrap">{getValue()}</span>
					);
				}
				const expenseRow = row.original;
				return (
					<InlineInput
						value={getValue()}
						ariaLabel={`name for ${getValue()}`}
						onCommit={(name) => onEdit(expenseRow, { name })}
						className="h-10"
						displayClassName="h-10 text-base"
						inputClassName="h-10"
					/>
				);
			},
		}),
		columnHelper.accessor("monthlyAmount", {
			id: "monthlyAmount",
			size: 130,
			header: `${targetCurrency}/Month`,
			cell: ({ getValue, row }) => {
				if (row.original.kind === "other") {
					return <span>{formatCurrency(getValue(), targetCurrency)}</span>;
				}
				const expenseRow = row.original;
				return (
					<InlineInput
						type="number"
						min={0}
						value={getValue()}
						displayValue={formatCurrency(getValue(), targetCurrency)}
						ariaLabel={`monthly amount for ${row.original.name}`}
						onCommit={(monthlyAmount) => {
							const expense = expenseRow.expense;
							if (expense.clpMonthlyPrice > 0) {
								onEdit(expenseRow, {
									originalPrice:
										expense.originalPrice *
										(monthlyAmount / expense.clpMonthlyPrice),
								});
								return;
							}
							onEdit(expenseRow, {
								originalPrice: monthlyAmount,
								originalCurrency: targetCurrency,
								rate: "Monthly",
							});
						}}
					/>
				);
			},
		}),
		columnHelper.accessor("realMonthlyAverage", {
			id: "realMonthlyAverage",
			size: 150,
			header: "Real avg./month",
			cell: ({ getValue, row }) => {
				const value = getValue();
				if (row.original.kind === "other" || value === null) {
					return <span>{formatAvailableCurrency(value, targetCurrency)}</span>;
				}

				const status = getRealMonthlyAverageStatus(
					row.original.monthlyAmount,
					value,
				);
				if (status === "unavailable") return null;
				const indicator = realMonthlyAverageIndicators[status];
				const IndicatorIcon = indicator.icon;

				return (
					<span
						className="inline-flex items-center gap-1.5"
						title={indicator.label}
					>
						<IndicatorIcon
							aria-hidden="true"
							className={`size-4 shrink-0 ${indicator.className}`}
						/>
						<span>{formatCurrency(value, targetCurrency)}</span>
						<span className="sr-only">({indicator.label})</span>
					</span>
				);
			},
			sortUndefined: "last",
		}),
		columnHelper.accessor("category", {
			id: "category",
			size: 200,
			header: "Category",
			cell: ({ getValue, row }) => {
				const value = getValue();
				if (row.original.kind === "other" || value === "Mixed") {
					return <IconBadge icon={null} label="Mixed" />;
				}
				const expenseRow = row.original;
				return (
					<InlineCombobox
						value={value}
						aria-label={`category for ${row.original.name}`}
						align="start"
						options={expenseCategoryEnum.enumValues.map((category) => ({
							value: category,
							label: <ExpenseCategoryBadge value={category} />,
							searchValue: category,
						}))}
						selectedValueFormater={(category) => (
							<ExpenseCategoryBadge value={category} />
						)}
						onChange={(category) => onEdit(expenseRow, { category })}
					/>
				);
			},
			filterFn: (row, columnId, filterValue) =>
				(filterValue as ExpenseOverviewRow["category"][]).includes(
					row.getValue(columnId),
				),
		}),
		columnHelper.accessor("type", {
			id: "type",
			size: 100,
			header: "Type",
			cell: ({ getValue, row }) => {
				const value = getValue();
				if (row.original.kind === "other" || value === "Mixed") {
					return <IconBadge icon={null} label="Mixed" />;
				}
				const expenseRow = row.original;
				return (
					<InlineCombobox
						value={value}
						aria-label={`type for ${row.original.name}`}
						align="start"
						options={expenseTypeEnum.enumValues.map((type) => ({
							value: type,
							label: (
								<IconBadge
									icon={mapTypeToIcon(type)}
									label={type}
									className={typeToColorClass(type)}
								/>
							),
							searchValue: type,
						}))}
						selectedValueFormater={(type) => (
							<IconBadge
								icon={mapTypeToIcon(type)}
								label={type}
								className={typeToColorClass(type)}
							/>
						)}
						onChange={(type) => onEdit(expenseRow, { type })}
					/>
				);
			},
		}),
	];
}

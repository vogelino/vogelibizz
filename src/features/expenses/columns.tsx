import { createColumnHelper } from "@tanstack/react-table";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { IconBadge } from "@/components/ui/icon-badge";
import InternalLink from "@/components/ui/internal-link";
import type { CurrencyIdType } from "@/db/schema";
import { expenseQueryOptions } from "@/utility/data/queryOptions";
import { mapTypeToIcon, typeToColorClass } from "@/utility/expensesIconUtil";
import { formatCurrency } from "@/utility/formatUtil";
import type { ExpenseOverviewRow } from "./expenseOverviewRows";

const columnHelper = createColumnHelper<ExpenseOverviewRow>();

function formatAvailableCurrency(
	value: number | null,
	currency: CurrencyIdType,
) {
	return value === null ? "–" : formatCurrency(value, currency);
}

export function getExpensesTableColumns(targetCurrency: CurrencyIdType) {
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
				const id = row.original.id;
				return (
					<InternalLink
						to="/expenses/edit/$id/modal"
						params={{ id: String(id) }}
						search
						className="text-base -ml-3 bg-transparent whitespace-nowrap"
						mask={{
							to: "/expenses/edit/$id",
							params: { id: String(id) },
							unmaskOnReload: true,
						}}
						prefetchQuery={expenseQueryOptions(id)}
					>
						{getValue()}
					</InternalLink>
				);
			},
		}),
		columnHelper.accessor("monthlyAmount", {
			id: "monthlyAmount",
			size: 130,
			header: `${targetCurrency}/Month`,
			cell: ({ getValue }) => (
				<span>{formatCurrency(getValue(), targetCurrency)}</span>
			),
		}),
		columnHelper.accessor("realMonthlyAverage", {
			id: "realMonthlyAverage",
			size: 150,
			header: "Real avg./month",
			cell: ({ getValue }) => (
				<span>{formatAvailableCurrency(getValue(), targetCurrency)}</span>
			),
			sortUndefined: "last",
		}),
		columnHelper.accessor("difference", {
			id: "difference",
			size: 160,
			header: "Configured − real",
			cell: ({ getValue }) => (
				<span>{formatAvailableCurrency(getValue(), targetCurrency)}</span>
			),
			sortUndefined: "last",
		}),
		columnHelper.accessor((row) => row.expense?.originalPrice ?? null, {
			id: "originalPrice",
			size: 120,
			header: "Original price",
			cell: ({ getValue, row }) => {
				const value = getValue();
				return value === null || row.original.kind === "other" ? (
					<span>–</span>
				) : (
					<span>
						{formatCurrency(value, row.original.expense.originalCurrency)}
					</span>
				);
			},
			sortUndefined: "last",
		}),
		columnHelper.accessor((row) => row.expense?.rate ?? "Automatic", {
			id: "rate",
			size: 110,
			header: "Billing Freq.",
		}),
		columnHelper.accessor("category", {
			id: "category",
			size: 200,
			header: "Category",
			cell: ({ getValue }) => {
				const value = getValue();
				return value === "Mixed" ? (
					<IconBadge icon={null} label="Mixed" />
				) : (
					<ExpenseCategoryBadge value={value} />
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
			cell: ({ getValue }) => {
				const value = getValue();
				return value === "Mixed" ? (
					<IconBadge icon={null} label="Mixed" />
				) : (
					<IconBadge
						icon={mapTypeToIcon(value)}
						label={value}
						className={typeToColorClass(value)}
					/>
				);
			},
		}),
	];
}

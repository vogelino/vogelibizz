import { createColumnHelper } from "@tanstack/react-table";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/ui/icon-badge";
import InternalLink from "@/components/ui/internal-link";
import { expenseHistoryTransactionQueryOptions } from "@/utility/data/queryOptions";
import type { ExpenseHistoryTransaction } from "@/utility/expenseHistoryContracts";
import { mapTypeToIcon, typeToColorClass } from "@/utility/expensesIconUtil";
import { formatCurrency, locale } from "@/utility/formatUtil";

const columnHelper = createColumnHelper<ExpenseHistoryTransaction>();

function formatDate(date: string) {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

export function getExpenseHistoryColumns(month: string) {
	return [
		columnHelper.accessor("bookedAt", {
			header: "Booked",
			size: 140,
			cell: ({ getValue }) => formatDate(getValue()),
		}),
		columnHelper.accessor("description", {
			header: "Description",
			size: 520,
			cell: ({ getValue, row }) => {
				const transaction = row.original;
				return (
					<div className="min-w-64">
						<InternalLink
							to="/expenses/history/edit/$id/modal"
							params={{ id: String(transaction.id) }}
							search={{ month }}
							mask={{
								to: "/expenses/history/edit/$id",
								params: { id: String(transaction.id) },
								unmaskOnReload: true,
							}}
							prefetchQuery={expenseHistoryTransactionQueryOptions(
								transaction.id,
							)}
							className="-ml-3 text-base"
						>
							{getValue()}
						</InternalLink>
						<details className="mt-1 text-xs text-muted-foreground">
							<summary className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
								Original bank details
							</summary>
							<div className="mt-1 max-w-xl whitespace-normal">
								{transaction.originalDescription} ·{" "}
								{formatCurrency(transaction.originalAmount, "CHF")}
								{transaction.valueDate
									? ` · Value date ${formatDate(transaction.valueDate)}`
									: ""}
							</div>
						</details>
					</div>
				);
			},
		}),
		columnHelper.accessor("amount", {
			header: "Amount",
			size: 150,
			cell: ({ getValue }) => (
				<span className="font-mono">{formatCurrency(getValue(), "CHF")}</span>
			),
		}),
		columnHelper.accessor((row) => row.expense, {
			id: "association",
			header: "Association",
			size: 240,
			cell: ({ getValue }) => {
				const expense = getValue();
				return expense ? (
					expense.name
				) : (
					<Badge variant="secondary">Other</Badge>
				);
			},
			filterFn: (row, _columnId, filterValue) =>
				!filterValue || row.original.expense === null,
		}),
		columnHelper.accessor("category", {
			header: "Category",
			size: 200,
			cell: ({ getValue }) => {
				const category = getValue();
				return category ? (
					<ExpenseCategoryBadge value={category} />
				) : (
					<Badge variant="outline">Unclassified</Badge>
				);
			},
		}),
		columnHelper.accessor("type", {
			header: "Type",
			size: 160,
			cell: ({ getValue }) => {
				const type = getValue();
				return type ? (
					<IconBadge
						icon={mapTypeToIcon(type)}
						label={type}
						className={typeToColorClass(type)}
					/>
				) : (
					<Badge variant="outline">Unclassified</Badge>
				);
			},
		}),
	];
}

import { createColumnHelper } from "@tanstack/react-table";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { Checkbox } from "@/components/ui/checkbox";
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

type ExpenseHistorySearch = {
	month?: string;
	category?: NonNullable<ExpenseHistoryTransaction["category"]>[];
	type?: NonNullable<ExpenseHistoryTransaction["type"]> | "All types";
	otherOnly?: boolean;
};

export function getExpenseHistoryColumns(search: ExpenseHistorySearch) {
	return [
		columnHelper.display({
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(checked) =>
						table.toggleAllPageRowsSelected(Boolean(checked))
					}
					aria-label="Select all transactions"
					className="mr-4"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
					aria-label={`Select ${row.original.description}`}
					className="mr-4"
				/>
			),
			size: 36,
			enableSorting: false,
			enableHiding: false,
		}),
		columnHelper.accessor("bookedAt", {
			header: "Booked",
			size: 180,
			cell: ({ getValue }) => (
				<span className="text-muted-foreground text-nowrap">
					{formatDate(getValue())}
				</span>
			),
		}),
		columnHelper.accessor("description", {
			header: "Description",
			size: 520,
			cell: ({ getValue, row }) => {
				const transaction = row.original;
				return (
					<div className="min-w-64 max-w-120 truncate">
						<InternalLink
							to="/expenses/history/edit/$id/modal"
							params={{ id: String(transaction.id) }}
							search={search}
							mask={{
								to: "/expenses/history/edit/$id",
								params: { id: String(transaction.id) },
								unmaskOnReload: true,
							}}
							prefetchQuery={expenseHistoryTransactionQueryOptions(
								transaction.id,
							)}
							className="text-base -ml-3 bg-transparent whitespace-nowrap"
						>
							{getValue()}
						</InternalLink>
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
					<span className="italic text-muted-foreground">Other</span>
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
					<span className="italic text-muted-foreground">Unclassified</span>
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
					<span className="italic text-muted-foreground">Unclassified</span>
				);
			},
		}),
	];
}

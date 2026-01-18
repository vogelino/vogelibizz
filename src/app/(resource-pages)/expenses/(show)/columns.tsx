import { createColumnHelper } from "@tanstack/react-table";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { IconBadge } from "@/components/ui/icon-badge";
import InternalLink from "@/components/ui/internal-link";
import type { ExpenseWithMonthlyCLPPriceType } from "@/db/schema";
import { mapTypeToIcon, typeToColorClass } from "@/utility/expensesIconUtil";
import { formatCurrency } from "@/utility/formatUtil";

const columnHelper = createColumnHelper<ExpenseWithMonthlyCLPPriceType>();

export const expensesTableColumns = [
	columnHelper.accessor("name", {
		id: "name",
		size: 1000,
		header: "Name",
		cell: function render({ getValue, row }) {
			const id = row.original.id;
			const value = getValue<string>();
			return <InternalLink href={`/expenses/edit/${id}`}>{value}</InternalLink>;
		},
	}),
	columnHelper.accessor("clpMonthlyPrice", {
		id: "clpMonthlyPrice",
		size: 100,
		header: "CLP/Month",
		cell: function render({ getValue }) {
			const value =
				getValue<ExpenseWithMonthlyCLPPriceType["clpMonthlyPrice"]>();
			return (
				<span className="font-mono">{value && formatCurrency(value)}</span>
			);
		},
	}),
	columnHelper.accessor("originalPrice", {
		id: "originalPrice",
		size: 100,
		header: "Original price",
		cell: function render({ getValue, row }) {
			const currency = row.original.originalCurrency;
			const value = getValue<ExpenseWithMonthlyCLPPriceType["originalPrice"]>();
			return (
				<span className="font-mono">
					{value && formatCurrency(value, currency)}
				</span>
			);
		},
	}),
	columnHelper.accessor("rate", {
		id: "rate",
		size: 100,
		header: "Billing Freq.",
	}),
	columnHelper.accessor("category", {
		id: "category",
		size: 200,
		header: "Category",
		cell: function render({ getValue }) {
			const value = getValue<ExpenseWithMonthlyCLPPriceType["category"]>();
			return <ExpenseCategoryBadge value={value} />;
		},
		filterFn: (row, columnId, filterValue) => {
			const filterValues =
				filterValue as ExpenseWithMonthlyCLPPriceType["category"][];
			return filterValues.includes(row.getValue(columnId));
		},
	}),
	columnHelper.accessor("type", {
		id: "type",
		size: 100,
		header: "Type",
		cell: function render({ getValue }) {
			const value = getValue<ExpenseWithMonthlyCLPPriceType["type"]>();
			return (
				<IconBadge
					icon={mapTypeToIcon(value)}
					label={value}
					className={typeToColorClass(value)}
				/>
			);
		},
	}),
];

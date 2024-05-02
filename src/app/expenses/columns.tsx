import ExpenseCategoryBadge from "@components/ExpenseCategoryBadge";
import { IconBadge } from "@components/ui/icon-badge";
import InternalLink from "@components/ui/internal-link";
import type { ExpenseType } from "@db/schema";
import { createColumnHelper } from "@tanstack/react-table";
import {
	getValueInCLPPerMonth,
	mapTypeToIcon,
	typeToColorClass,
} from "@utility/expensesUtil";
import { formatCurrency } from "@utility/formatUtil";

const columnHelper = createColumnHelper<ExpenseType>();

export const getExpensesTableColumns = (
	rates: null | Record<ExpenseType["original_currency"], number>,
) => [
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
	columnHelper.accessor(
		(row) =>
			getValueInCLPPerMonth({
				value: row.price,
				currency: row.original_currency,
				rates,
				billingRate: row.rate,
			}) ?? 0,
		{
			id: "monthly_price_clp",
			size: 100,
			header: "CLP/Month",
			cell: function render({ getValue, row }) {
				const value = getValue<ExpenseType["price"]>();
				return (
					<span className="font-mono">{value && formatCurrency(value)}</span>
				);
			},
			sortingFn: (rowA, rowB) => {
				const valueAInCLPPerMonth =
					getValueInCLPPerMonth({
						value: rowA.original.price,
						currency: rowA.original.original_currency,
						rates,
						billingRate: rowA.original.rate,
					}) || 0;
				const valueBInCLPPerMonth =
					getValueInCLPPerMonth({
						value: rowB.original.price,
						currency: rowB.original.original_currency,
						rates,
						billingRate: rowB.original.rate,
					}) || 0;

				return valueAInCLPPerMonth - valueBInCLPPerMonth;
			},
		},
	),
	columnHelper.accessor("price", {
		id: "price",
		size: 100,
		header: "Original price",
		cell: function render({ getValue, row }) {
			const currency = row.original.original_currency;
			const value = getValue<ExpenseType["price"]>();
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
			const value = getValue<ExpenseType["category"]>();
			return <ExpenseCategoryBadge value={value} />;
		},
	}),
	columnHelper.accessor("type", {
		id: "type",
		size: 100,
		header: "Type",
		cell: function render({ getValue }) {
			const value = getValue<ExpenseType["type"]>();
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

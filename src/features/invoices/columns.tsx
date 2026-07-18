import { createColumnHelper } from "@tanstack/react-table";
import InternalLink from "@/components/ui/internal-link";
import type { InvoiceType } from "@/db/schema";
import { invoiceQueryOptions } from "@/utility/data/queryOptions";
import { formatCurrency } from "@/utility/formatUtil";
import { getInvoiceHours, getInvoiceTotal } from "./invoiceTotals";

const columnHelper = createColumnHelper<InvoiceType>();

export const invoiceTableColumns = [
	columnHelper.accessor("id", {
		size: 50,
		minSize: 50,
		maxSize: 50,
		header: () => (
			<span className="text-muted-foreground group-hover:text-inherit">ID</span>
		),
		cell: ({ getValue }) => (
			<span className="text-muted-foreground">{getValue<number>()}</span>
		),
	}),
	columnHelper.accessor("name", {
		size: 420,
		header: "Name",
		cell: ({ getValue, row }) => {
			const id = row.original.id;
			return (
				<InternalLink
					to="/invoices/$id"
					params={{ id: String(id) }}
					className="text-base -ml-3 bg-transparent whitespace-nowrap"
					prefetchQuery={invoiceQueryOptions(id)}
				>
					{getValue<string>()}
				</InternalLink>
			);
		},
	}),
	columnHelper.accessor("invoiceNumber", {
		size: 120,
		header: "Invoice #",
	}),
	columnHelper.accessor("date", {
		size: 140,
		header: "Date",
		cell: ({ getValue, row }) => {
			const value = getValue<string>();
			return (
				<span>
					{new Intl.DateTimeFormat(row.original.language).format(
						new Date(value),
					)}
				</span>
			);
		},
	}),
	columnHelper.accessor((row) => row.clients?.[0]?.name ?? "", {
		id: "client",
		size: 220,
		header: "Client",
		cell: ({ getValue }) => <span>{getValue() || "—"}</span>,
	}),
	columnHelper.accessor((row) => row.projects?.[0]?.name ?? "", {
		id: "project",
		size: 220,
		header: "Project",
		cell: ({ getValue }) => <span>{getValue() || "—"}</span>,
	}),
	columnHelper.accessor(getInvoiceHours, {
		id: "hours",
		size: 100,
		header: "Hours",
		cell: ({ getValue }) => <span>{getValue()}</span>,
	}),
	columnHelper.accessor(getInvoiceTotal, {
		id: "total",
		size: 140,
		header: "Total",
		cell: ({ getValue, row }) => (
			<span>{formatCurrency(getValue(), row.original.currency)}</span>
		),
	}),
];

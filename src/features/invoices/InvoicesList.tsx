"use client";

import { useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import PageDataTable from "@/components/PageDataTable";
import type { InvoiceType } from "@/db/schema";
import { filterRowsByText } from "@/features/search/searchEngine";
import useClients from "@/utility/data/useClients";
import useInvoiceEdit from "@/utility/data/useInvoiceEdit";
import useInvoices from "@/utility/data/useInvoices";
import useProjects from "@/utility/data/useProjects";
import { getInvoiceTableColumns } from "./columns";

export default function InvoicesList({
	loading = false,
}: {
	loading?: boolean;
}) {
	const { data = [], error, isPending } = useInvoices();
	const { q } = useSearch({ from: "/_resource/invoices" });
	const { data: clients = [], isPending: clientsPending } = useClients();
	const { data: projects = [], isPending: projectsPending } = useProjects();
	const editMutation = useInvoiceEdit();
	const isLoading = loading || isPending;
	const editInvoice = useCallback(
		(invoice: InvoiceType, change: Partial<InvoiceType>) => {
			editMutation.mutate({ id: invoice.id, ...change });
		},
		[editMutation],
	);
	const columns = useMemo(
		() =>
			getInvoiceTableColumns(
				editInvoice,
				clients,
				projects,
				clientsPending || projectsPending,
			),
		[clients, clientsPending, editInvoice, projects, projectsPending],
	);
	const visibleData = useMemo(
		() =>
			filterRowsByText(
				data,
				q,
				(invoice) => invoice.id,
				(invoice) =>
					[
						invoice.id,
						invoice.name,
						invoice.invoiceNumber,
						invoice.subject,
						invoice.clients?.map(({ name }) => name).join(" "),
						invoice.projects?.map(({ name }) => name).join(" "),
						invoice.rows.map(({ description }) => description).join(" "),
					]
						.filter(Boolean)
						.join(" "),
			),
		[data, q],
	);

	return (
		<PageDataTable<InvoiceType>
			resource="invoices"
			columns={columns}
			data={!error && visibleData.length > 0 ? visibleData : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
		/>
	);
}

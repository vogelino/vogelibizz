"use client";

import { useCallback, useMemo } from "react";
import PageDataTable from "@/components/PageDataTable";
import type { InvoiceType } from "@/db/schema";
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

	return (
		<PageDataTable<InvoiceType>
			resource="invoices"
			columns={columns}
			data={!error && data.length > 0 ? data : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
		/>
	);
}

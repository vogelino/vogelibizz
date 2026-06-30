"use client";

import PageDataTable from "@/components/PageDataTable";
import type { InvoiceType } from "@/db/schema";
import useInvoices from "@/utility/data/useInvoices";
import { invoiceTableColumns } from "./columns";

export default function InvoicesList({
	loading = false,
}: {
	loading?: boolean;
}) {
	const { data = [], error, isPending } = useInvoices();
	const isLoading = loading || isPending;

	return (
		<PageDataTable<InvoiceType>
			resource="invoices"
			columns={invoiceTableColumns}
			data={!error && data.length > 0 ? data : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
		/>
	);
}

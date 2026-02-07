"use client";

import PageDataTable from "@/components/PageDataTable";
import type { ClientType } from "@/db/schema";
import useClients from "@/utility/data/useClients";
import { clientTableColumns } from "./columns";

export default function ClientList({ loading = false }: { loading?: boolean }) {
	const { data = [], error, isPending } = useClients();
	const isLoading = loading || isPending;

	return (
		<PageDataTable<ClientType>
			resource="clients"
			columns={clientTableColumns}
			data={!error && data.length > 0 ? data : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
		/>
	);
}

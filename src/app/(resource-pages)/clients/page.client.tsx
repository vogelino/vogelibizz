"use client";

import PageDataTable from "@/components/PageDataTable";
import type { ClientType } from "@/db/schema";
import useClientDelete from "@/utility/data/useClientDelete";
import useClients from "@/utility/data/useClients";
import { clientTableColumns } from "./columns";

export default function ProjectList() {
	const { data, error } = useClients();
	const deleteMutation = useClientDelete();

	return (
		<PageDataTable<ClientType>
			resource="clients"
			columns={clientTableColumns}
			deleteAction={(id) => deleteMutation.mutate(id)}
			data={!error && data.length > 0 ? data : []}
			defaultSortColumn="last_modified"
		/>
	);
}

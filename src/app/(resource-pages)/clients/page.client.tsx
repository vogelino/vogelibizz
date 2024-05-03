"use client";

import PageDataTable from "@/components/PageDataTable";
import useClients, { type ClientType } from "@/utility/data/useClients";
import { clientTableColumns } from "./columns";

export default function ProjectList() {
	const { data, error } = useClients();

	return (
		<PageDataTable<ClientType>
			resource="clients"
			columns={clientTableColumns}
			data={!error && data.length > 0 ? data : []}
			defaultSortColumn="last_modified"
		/>
	);
}

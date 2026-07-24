"use client";

import { useCallback, useMemo } from "react";
import PageDataTable from "@/components/PageDataTable";
import type { ClientType } from "@/db/schema";
import useClientEdit from "@/utility/data/useClientEdit";
import useClients from "@/utility/data/useClients";
import useProjects from "@/utility/data/useProjects";
import { getClientTableColumns } from "./columns";

export default function ClientList({ loading = false }: { loading?: boolean }) {
	const { data = [], error, isPending } = useClients();
	const { data: projects = [], isPending: projectsPending } = useProjects();
	const editMutation = useClientEdit();
	const isLoading = loading || isPending;
	const editClient = useCallback(
		(client: ClientType, change: Partial<ClientType>) => {
			editMutation.mutate({ id: client.id, ...change });
		},
		[editMutation],
	);
	const columns = useMemo(
		() => getClientTableColumns(editClient, projects, projectsPending),
		[editClient, projects, projectsPending],
	);

	return (
		<PageDataTable<ClientType>
			resource="clients"
			columns={columns}
			data={!error && data.length > 0 ? data : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
		/>
	);
}

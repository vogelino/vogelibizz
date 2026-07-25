"use client";

import { useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import PageDataTable from "@/components/PageDataTable";
import type { ClientType } from "@/db/schema";
import { filterRowsByText } from "@/features/search/searchEngine";
import useClientEdit from "@/utility/data/useClientEdit";
import useClients from "@/utility/data/useClients";
import useProjects from "@/utility/data/useProjects";
import { getClientTableColumns } from "./columns";

export default function ClientList({ loading = false }: { loading?: boolean }) {
	const { data = [], error, isPending } = useClients();
	const { q } = useSearch({ from: "/_resource/clients" });
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
	const visibleData = useMemo(
		() =>
			filterRowsByText(
				data,
				q,
				(client) => client.id,
				(client) =>
					[
						client.id,
						client.name,
						client.legalName,
						client.clientNumber,
						client.taxId,
						client.projects?.map(({ name }) => name).join(" "),
					]
						.filter(Boolean)
						.join(" "),
			),
		[data, q],
	);

	return (
		<PageDataTable<ClientType>
			resource="clients"
			columns={columns}
			data={!error && visibleData.length > 0 ? visibleData : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
		/>
	);
}

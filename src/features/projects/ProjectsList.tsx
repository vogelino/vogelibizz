"use client";

import { useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import PageDataTable from "@/components/PageDataTable";
import type { ProjectType } from "@/db/schema";
import {
	amountSearchText,
	filterRowsByText,
} from "@/features/search/searchEngine";
import useClients from "@/utility/data/useClients";
import useProjectEdit from "@/utility/data/useProjectEdit";
import useProjects from "@/utility/data/useProjects";
import { getProjectTableColumns } from "./columns";

export default function ProjectList({
	loading = false,
}: {
	loading?: boolean;
}) {
	const { data = [], error, isPending } = useProjects();
	const { q } = useSearch({ from: "/_resource/projects" });
	const { data: clients = [], isPending: clientsPending } = useClients();
	const editMutation = useProjectEdit();
	const isLoading = loading || isPending;
	const editProject = useCallback(
		(project: ProjectType, change: Partial<ProjectType>) => {
			const {
				created_at: _createdAt,
				last_modified: _lastModified,
				...editableProject
			} = project;
			editMutation.mutate({ ...editableProject, ...change, id: project.id });
		},
		[editMutation],
	);
	const columns = useMemo(
		() => getProjectTableColumns(editProject, clients, clientsPending),
		[clients, clientsPending, editProject],
	);
	const visibleData = useMemo(
		() =>
			filterRowsByText(
				data,
				q,
				(project) => project.id,
				(project) =>
					[
						project.id,
						project.name,
						project.status,
						project.description,
						project.content,
						amountSearchText(project.hourlyRate),
						project.clients?.map(({ name }) => name).join(" "),
					]
						.filter(Boolean)
						.join(" "),
			),
		[data, q],
	);

	return (
		<PageDataTable<ProjectType>
			resource="projects"
			columns={columns}
			data={!error && visibleData.length > 0 ? visibleData : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
		/>
	);
}

"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
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
import { useUrlSearchState } from "@/utility/useUrlSearchState";
import { getProjectTableColumns } from "./columns";
import { ProjectFilter, type ProjectFilterState } from "./ProjectFilter";

const projectFilterDefaults: ProjectFilterState = {
	statuses: [],
	clientIds: [],
};

export default function ProjectList({
	loading = false,
}: {
	loading?: boolean;
}) {
	const { data = [], error, isPending } = useProjects();
	const search = useSearch({ from: "/_resource/projects" });
	const navigate = useNavigate({ from: "/projects" });
	const updateSearch = useCallback(
		(nextSearch: typeof search) =>
			navigate({ search: nextSearch, replace: true }),
		[navigate],
	);
	const [filters, setFilters] = useUrlSearchState(
		search,
		projectFilterDefaults,
		updateSearch,
	);
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
				search.q,
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
		[data, search.q],
	);
	const filteredData = useMemo(() => {
		const selectedStatuses = new Set(filters.statuses);
		const selectedClientIds = new Set(filters.clientIds);
		return visibleData.filter(
			(project) =>
				(!selectedStatuses.size || selectedStatuses.has(project.status)) &&
				(!selectedClientIds.size ||
					project.clients?.some((client) =>
						selectedClientIds.has(String(client.id)),
					)),
		);
	}, [filters, visibleData]);

	return (
		<PageDataTable<ProjectType>
			resource="projects"
			columns={columns}
			data={!error && filteredData.length > 0 ? filteredData : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
			toolbarSkeleton={
				<div className="px-6 pt-3 md:px-10">
					<ProjectFilter loading clients={[]} />
				</div>
			}
			toolbar={() => (
				<div className="sticky left-0 flex flex-wrap items-center gap-4 px-6 pt-3 md:px-10">
					<ProjectFilter
						loading={false}
						clients={clients}
						filters={filters}
						onFiltersChange={setFilters}
					/>
				</div>
			)}
		/>
	);
}

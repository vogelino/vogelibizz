"use client";

import PageDataTable from "@/components/PageDataTable";
import type { ProjectType } from "@/db/schema";
import useProjects from "@/utility/data/useProjects";
import { projectTableColumns } from "./columns";

export default function ProjectList() {
	const { data, error } = useProjects();

	return (
		<PageDataTable<ProjectType>
			resource="projects"
			columns={projectTableColumns}
			data={!error && data.length > 0 ? data : []}
			defaultSortColumn="last_modified"
		/>
	);
}

"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectType } from "@/db/schema";
import { projectsQueryOptions } from "@/utility/data/queryOptions";

function useProjects({
	enabled = true,
	initialData,
}: {
	enabled?: boolean;
	initialData?: ProjectType[];
} = {}) {
	return useQuery({
		...projectsQueryOptions(),
		enabled,
		...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
	});
}

export default useProjects;

"use client";

import { useQuery } from "@tanstack/react-query";
import { type ProjectType, projectSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

function useProjects({ enabled = true }: { enabled?: boolean } = {}) {
	const queryFn = createQueryFunction<ProjectType[]>({
		resourceName: "projects",
		action: "queryAll",
		outputZodSchema: projectSelectSchema.array(),
	});
	return useQuery({
		...queryKeys.projects.list,
		queryFn,
		enabled,
	});
}

export default useProjects;

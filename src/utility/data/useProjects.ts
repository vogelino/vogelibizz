"use client";

import { useQuery } from "@tanstack/react-query";
import { type ProjectType, projectSelectSchema } from "@/db/schema";
import createQueryFunction from "./createQueryFunction";

type DataType = ProjectType[];
const resourceName = "projects";
const action = "queryAll";
const outputZodSchema = projectSelectSchema.array();

function useProjects({ enabled = true }: { enabled?: boolean } = {}) {
	const queryKey = [resourceName];
	return useQuery<DataType>({
		queryKey,
		enabled,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
		}),
	});
}

export default useProjects;

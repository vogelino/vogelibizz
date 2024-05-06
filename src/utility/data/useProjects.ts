"use client";

import { projectSelectSchema } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { handleFetchResponse } from "../dataHookUtil";

export const projectsQueryKey = ["projects"];
function useProjects() {
	const { data, isPending, error } = useSuspenseQuery({
		queryKey: projectsQueryKey,
		queryFn: getProjects,
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getProjects() {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/projects`,
	);

	return handleFetchResponse({
		response,
		crudAction: "query",
		resourceName: "projects",
		zodSchema: projectSelectSchema.array(),
	});
}

export default useProjects;

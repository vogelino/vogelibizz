"use client";

import type { ProjectInsertType, ProjectType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";
import { projectsQueryKey } from "./useProjects";

function useProjectCreate() {
	const queryProject = useQueryClient();
	return useMutation({
		mutationKey: ["project-create"],
		mutationFn: createProject,
		onMutate: (project: ProjectInsertType) => {
			queryProject.cancelQueries({ queryKey: projectsQueryKey });
			const previousData =
				queryProject.getQueryData<ProjectType[]>(projectsQueryKey);
			queryProject.setQueryData<ProjectType[]>(projectsQueryKey, (old) => [
				...(old || []),
				{
					id: (old?.at(-1)?.id ?? 99998) + 1,
					created_at: project.created_at || new Date().toISOString(),
					last_modified: project.last_modified || new Date().toISOString(),
					name: project.name ?? "Project",
					description: project.description ?? "",
					status: project.status ?? "todo",
					content: project.content ?? "",
				},
			]);
			toast.info(`Successfully created project '${project.name}'`);
			return { previousData };
		},
		onError: (err, { name }, context) => {
			queryProject.setQueryData<ProjectType[]>(
				projectsQueryKey,
				context?.previousData,
			);
			console.error(`Failed to create project with name '${name}'`, err);
			toast.error(`Failed to create project with name '${name}'`);
		},
		onSettled: () =>
			queryProject.invalidateQueries({ queryKey: projectsQueryKey }),
	});
}

export async function createProject(project: ProjectInsertType) {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/projects`,
		{ method: "POST", body: JSON.stringify([project]) },
	);

	return handleFetchResponse({
		response,
		data: project,
		crudAction: "create",
		resourceName: "projects",
	});
}

export default useProjectCreate;

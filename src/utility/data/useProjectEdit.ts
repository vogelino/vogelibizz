"use client";

import type { ProjectType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";
import { projectsQueryKey } from "./useProjects";

function useProjectEdit() {
	const queryProject = useQueryClient();
	const deleteMutation = useMutation({
		mutationKey: ["project-edit"],
		mutationFn: editProject,
		onMutate: (project: ProjectType) => {
			queryProject.cancelQueries({ queryKey: projectsQueryKey });
			const previousData =
				queryProject.getQueryData<ProjectType[]>(projectsQueryKey);
			queryProject.setQueryData<ProjectType[]>(projectsQueryKey, (old) =>
				old?.map((c) => {
					if (c.id === project.id) return project;
					return c;
				}),
			);
			toast.info(
				`Successfully edited project '${project.name}' (ID: ${project.id})`,
			);
			return { previousData };
		},
		onError: (err, { id }, context) => {
			queryProject.setQueryData<ProjectType[]>(
				projectsQueryKey,
				context?.previousData,
			);
			console.error(`Failed to edit project with id ${id}`, err);
			toast.error(`Failed to edit project with id ${id}`);
		},
		onSettled: () =>
			queryProject.invalidateQueries({ queryKey: projectsQueryKey }),
	});

	return deleteMutation;
}

export async function editProject(project: ProjectType) {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/projects/${project.id}`,
		{ method: "PATCH", body: JSON.stringify(project) },
	);

	return handleFetchResponse({
		response,
		data: project,
		crudAction: "edit",
		resourceName: "projects",
	});
}

export default useProjectEdit;

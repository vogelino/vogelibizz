"use client";

import type { ProjectType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";

const projectsQueryKey = ["projects"];
function useProjectDelete() {
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationKey: ["project-delete"],
		mutationFn: deleteClientApi,
		onMutate: (id: number) => {
			queryClient.cancelQueries({ queryKey: projectsQueryKey });
			const previousData =
				queryClient.getQueryData<ProjectType[]>(projectsQueryKey);
			queryClient.setQueryData<ProjectType[]>(projectsQueryKey, (old) =>
				old?.filter((c) => c.id !== id),
			);
			return { previousData };
		},
		onSuccess: (_data, id) => {
			toast.info(`Successfully deleted project with "${id}"`);
		},
		onError: (err, id, context) => {
			queryClient.setQueryData<ProjectType[]>(
				projectsQueryKey,
				context?.previousData,
			);
			console.error(`Failed to delete project with id ${id}`, err);
			toast.error(`Failed to delete project with id ${id}: ${err}`);
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: projectsQueryKey }),
	});

	return deleteMutation;
}

export async function deleteClientApi(id: number) {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/projects/${id}`,
		{ method: "DELETE" },
	);

	return handleFetchResponse({
		response,
		data: id,
		crudAction: "delete",
		resourceName: "projects",
	});
}

export default useProjectDelete;

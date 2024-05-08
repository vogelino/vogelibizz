"use client";

import type { ClientInsertType, ClientType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";

const clientsQueryKey = ["clients"];
function useClientCreate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["client-create"],
		mutationFn: createClient,
		onMutate: (client: ClientInsertType) => {
			queryClient.cancelQueries({ queryKey: clientsQueryKey });
			const previousData =
				queryClient.getQueryData<ClientType[]>(clientsQueryKey);
			queryClient.setQueryData<ClientType[]>(clientsQueryKey, (old) => [
				...(old || []),
				{
					id: (old?.at(-1)?.id ?? 99998) + 1,
					created_at: client.created_at || new Date().toISOString(),
					last_modified: client.last_modified || new Date().toISOString(),
					...client,
				},
			]);
			toast.info(`Successfully created client '${client.name}'`);
			return { previousData };
		},
		onError: (err, { name }, context) => {
			queryClient.setQueryData<ClientType[]>(
				clientsQueryKey,
				context?.previousData,
			);
			console.error(`Failed to create client with name '${name}'`, err);
			toast.error(`Failed to create client with name '${name}'`);
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: clientsQueryKey }),
	});
}

export async function createClient(client: ClientInsertType) {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/clients`,
		{ method: "POST", body: JSON.stringify([client]) },
	);

	return handleFetchResponse({
		response,
		data: client,
		crudAction: "create",
		resourceName: "clients",
	});
}

export default useClientCreate;

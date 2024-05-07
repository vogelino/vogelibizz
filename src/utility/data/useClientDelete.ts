"use client";

import type { ClientType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";
import { clientsQueryKey } from "./useClients";

function useClientDelete() {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationKey: ["client-delete"],
    mutationFn: deleteClientApi,
    onMutate: (id: number) => {
      queryClient.cancelQueries({ queryKey: clientsQueryKey });
      const previousData =
        queryClient.getQueryData<ClientType[]>(clientsQueryKey);
      queryClient.setQueryData<ClientType[]>(clientsQueryKey, (old) =>
        old?.filter((c) => c.id !== id)
      );
      return { previousData };
    },
    onSuccess: (_data, id) => {
      toast.info(`Successfully deleted expense with "${id}"`);
    },
    onError: (err, id, context) => {
      queryClient.setQueryData<ClientType[]>(
        clientsQueryKey,
        context?.previousData
      );
      console.error(`Failed to delete client with id ${id}`, err);
      toast.error(`Failed to delete client with id ${id}: ${err}`);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clientsQueryKey }),
  });

  return deleteMutation;
}

export async function deleteClientApi(id: number) {
  const response = await fetch(
    `${env.client.NEXT_PUBLIC_BASE_URL}/api/clients/${id}`,
    { method: "DELETE" }
  );

  return handleFetchResponse({
    response,
    data: id,
    crudAction: "delete",
    resourceName: "clients",
  });
}

export default useClientDelete;

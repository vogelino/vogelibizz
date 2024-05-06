"use client";

import type { ClientType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsQueryKey } from "./useClients";

function useClientEdit() {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationKey: ["client-edit"],
    mutationFn: editClient,
    onMutate: (client: ClientType) => {
      queryClient.cancelQueries({ queryKey: clientsQueryKey });
      const previousData =
        queryClient.getQueryData<ClientType[]>(clientsQueryKey);
      queryClient.setQueryData<ClientType[]>(clientsQueryKey, (old) =>
        old?.map((c) => {
          if (c.id === client.id) return client;
          return c;
        })
      );
      toast.info(
        `Successfully edited client '${client.name}' (ID: ${client.id})`
      );
      return { previousData };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData<ClientType[]>(
        clientsQueryKey,
        context?.previousData
      );
      console.error(`Failed to edit client with id ${id}`, err);
      toast.error(`Failed to edit client with id ${id}`);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clientsQueryKey }),
  });

  return deleteMutation;
}

export async function editClient(client: ClientType) {
  const response = await fetch(
    `${env.client.NEXT_PUBLIC_BASE_URL}/api/clients/${client.id}`,
    { method: "PATCH", body: JSON.stringify(client) }
  );

  const clientLogDescription = `client '${client.name}' (ID: ${client.id})`;
  if (!response.ok) {
    throw new Error(
      `Failed to edit client '${clientLogDescription}: ${response.status} -> ${response.statusText}`
    );
  }

  try {
    const json = await response.json();
    return json as { success: true };
  } catch (err) {
    throw new Error(
      `Failed to parse ${clientLogDescription}'s json response: ${err}`
    );
  }
}

export default useClientEdit;

import type { ClientType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";

function useClient(id: number | undefined) {
  const queryKey = ["client", id];
  const { data, isPending, error } = useSuspenseQuery({
    queryKey,
    queryFn: () => getClient(id),
  });

  return {
    data,
    isPending,
    error,
  };
}

export async function getClient(id: number | undefined) {
  if (!id) return null;
  const response = await fetch(
    `${env.client.NEXT_PUBLIC_BASE_URL}/api/clients/${id}`
  );
  const json = await response.json();

  return json as ClientType;
}

export default useClient;

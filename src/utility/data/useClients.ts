import type { ClientType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";

function useClients() {
  const queryKey = ["clients"];
  const { data, isPending, error } = useSuspenseQuery({
    queryKey,
    queryFn: getClients,
  });

  return {
    data,
    isPending,
    error,
  };
}

export async function getClients() {
  const response = await fetch(
    `${env.client.NEXT_PUBLIC_BASE_URL}/api/clients`
  );
  const json = await response.json();

  return json as ClientType[];
}

export default useClients;

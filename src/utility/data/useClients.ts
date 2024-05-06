import type { ClientType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";

export const clientsQueryKey = ["clients"];
function useClients() {
  const { data, isPending, error } = useSuspenseQuery({
    queryKey: clientsQueryKey,
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

  if (json.error === "Unauthorized")
    return redirect(`${env.server.NEXT_PUBLIC_BASE_URL}/login`);
  if (json.error) throw new Error(json.error);

  return json as ClientType[];
}

export default useClients;

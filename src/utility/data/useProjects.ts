import type { ProjectType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";

function useProjects() {
  const queryKey = ["projects"];
  const { data, isPending, error } = useSuspenseQuery({
    queryKey,
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
    `${env.client.NEXT_PUBLIC_BASE_URL}/api/projects`
  );
  const json = await response.json();

  return json as ProjectType[];
}

export default useProjects;

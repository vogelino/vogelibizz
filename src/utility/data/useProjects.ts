"use client";

import type { ProjectType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";

export const projectsQueryKey = ["projects"];
function useProjects() {
  const { data, isPending, error } = useSuspenseQuery({
    queryKey: projectsQueryKey,
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

  if (json.error === "Unauthorized") return redirect("/login");
  if (json.error) throw new Error(json.error);

  return json as ProjectType[];
}

export default useProjects;

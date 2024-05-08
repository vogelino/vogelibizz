"use client";

import { projectSelectSchema, type ProjectType } from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import createQueryFunction from "./createQueryFunction";

type DataType = ProjectType[];
const resourceName = "projects";
const action = "queryAll";
const outputZodSchema = projectSelectSchema.array();

function useProjects() {
  const queryKey = [resourceName];
  return useSuspenseQuery<DataType>({
    queryKey,
    queryFn: createQueryFunction<DataType>({
      resourceName,
      action,
      outputZodSchema,
    }),
  });
}

export default useProjects;

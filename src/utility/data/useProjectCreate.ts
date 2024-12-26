"use client";

import {
  type ProjectInsertType,
  type ProjectType,
  type ResourceType,
  projectInsertSchema,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";
import { getNowInUTC } from "../timeUtil";

const resourceName: ResourceType = "projects";
const action: ActionType = "create";
const inputZodSchema = projectInsertSchema.array();

const useProjectCreate = createMutationHook<ProjectType[]>({
  resourceName,
  action,
  inputZodSchema,
  mutationFn: createQueryFunction<void>({
    resourceName,
    action,
    inputZodSchema,
  }),
  createOptimisticDataEntry,
});

export default useProjectCreate;

function createOptimisticDataEntry(
  oldProjects: ProjectType[] | undefined,
  newProjects: ProjectInsertType[],
): ProjectType[] {
  return [
    ...(oldProjects || []),
    ...newProjects.map((project) => ({
      id: (oldProjects?.at(-1)?.id ?? 99998) + 1,
      created_at: getNowInUTC(),
      last_modified: getNowInUTC(),
      name: project.name ?? "Project",
      description: project.description ?? "",
      status: project.status ?? "todo",
      content: project.content ?? "",
    })),
  ];
}

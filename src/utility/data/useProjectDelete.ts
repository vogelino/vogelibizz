"use client";

import type { ProjectType, ResourceType } from "@/db/schema";
import { z } from "zod";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "projects";
const action: ActionType = "delete";
const inputZodSchema = z.number();

const useProjectDelete = createMutationHook<ProjectType[]>({
  resourceName,
  action,
  inputZodSchema,
  mutationFn: createQueryFunction<void>({
    resourceName,
    action,
  }),
  createOptimisticDataEntry,
});

export default useProjectDelete;

function createOptimisticDataEntry(
  oldData: ProjectType[] | undefined,
  deletedId: ProjectType["id"]
): ProjectType[] {
  return (oldData || []).filter((c) => c.id !== deletedId);
}

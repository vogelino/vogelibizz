"use client";

import {
  clientEditSchema,
  type ClientEditType,
  type ClientType,
  type ResourceType,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action: ActionType = "edit";
const inputZodSchema = clientEditSchema;

const useClientEdit = createMutationHook<ClientType[]>({
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

export default useClientEdit;

function createOptimisticDataEntry(
  oldData: ClientType[] | undefined,
  editedData: ClientEditType
) {
  return (oldData || []).map((c) =>
    c.id === editedData.id ? { ...c, ...editedData } : c
  );
}

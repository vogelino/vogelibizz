"use client";

import {
  projectEditSchema,
  type ExpenseEditType,
  type ExpenseWithMonthlyCLPPriceType,
  type ResourceType,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "projects";
const action: ActionType = "edit";
const inputZodSchema = projectEditSchema;

const useProjectEdit = createMutationHook<ExpenseWithMonthlyCLPPriceType[]>({
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

export default useProjectEdit;

function createOptimisticDataEntry(
  oldData: ExpenseWithMonthlyCLPPriceType[] | undefined,
  editedData: ExpenseEditType
): ExpenseWithMonthlyCLPPriceType[] {
  return (oldData || []).map((c) =>
    c.id === editedData.id ? { ...c, ...editedData } : c
  );
}

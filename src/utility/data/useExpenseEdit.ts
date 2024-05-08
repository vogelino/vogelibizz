"use client";

import {
  expenseInsertSchema,
  type ExpenseType,
  type ExpenseWithMonthlyCLPPriceType,
  type ResourceType,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "expenses";
const action: ActionType = "edit";
const inputZodSchema = expenseInsertSchema;

const useClientEdit = createMutationHook<ExpenseWithMonthlyCLPPriceType[]>({
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
  oldData: ExpenseWithMonthlyCLPPriceType[] | undefined,
  editedData: ExpenseType
) {
  return (oldData || []).map((c) =>
    c.id === editedData.id ? { ...c, ...editedData } : c
  );
}

"use client";

import {
  type ExpenseEditType,
  type ExpenseWithMonthlyCLPPriceType,
  type ResourceType,
  projectEditSchema,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";
import { getNowInUTC } from "../timeUtil";

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
  editedData: ExpenseEditType,
): ExpenseWithMonthlyCLPPriceType[] {
  return (oldData || []).map((c) =>
    c.id === editedData.id
      ? { ...c, ...editedData, last_modified: getNowInUTC() }
      : c,
  );
}

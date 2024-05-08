"use client";

import {
	type ExpenseType,
	type ExpenseWithMonthlyCLPPriceType,
	type ResourceType,
	projectInsertSchema,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "projects";
const action: ActionType = "edit";
const inputZodSchema = projectInsertSchema;

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
	editedData: ExpenseType,
) {
	return (oldData || []).filter((c) =>
		c.id === editedData.id ? { ...c, ...editedData } : c,
	);
}

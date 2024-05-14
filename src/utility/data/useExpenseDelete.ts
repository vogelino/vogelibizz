"use client";

import type { ExpenseType, ResourceType } from "@/db/schema";
import { z } from "zod";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "expenses";
const action: ActionType = "delete";
const inputZodSchema = z.number();

const useExpenseDelete = createMutationHook<ExpenseType[]>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void>({
		resourceName,
		action,
	}),
	createOptimisticDataEntry,
});

export default useExpenseDelete;

function createOptimisticDataEntry(
	oldData: ExpenseType[] | undefined,
	deletedId: ExpenseType["id"],
): ExpenseType[] {
	return (oldData || []).filter((c) => c.id !== deletedId);
}

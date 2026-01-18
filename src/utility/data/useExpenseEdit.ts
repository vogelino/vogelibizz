"use client";

import {
	type ExpenseEditType,
	type ExpenseWithMonthlyCLPPriceType,
	expenseEditSchema,
	type ResourceType,
} from "@/db/schema";
import { getNowInUTC } from "../timeUtil";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "expenses";
const action: ActionType = "edit";
const inputZodSchema = expenseEditSchema;

const useClientEdit = createMutationHook<
	ExpenseWithMonthlyCLPPriceType[],
	ExpenseEditType
>({
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
	editedData: ExpenseEditType,
): ExpenseWithMonthlyCLPPriceType[] {
	return (oldData || []).map((c) =>
		c.id === editedData.id
			? { ...c, ...editedData, last_modified: getNowInUTC() }
			: c,
	);
}

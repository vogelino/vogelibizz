"use client";

import {
	type ExpenseInsertType,
	type ExpenseWithMonthlyCLPPriceType,
	expenseInsertSchema,
	type ResourceType,
} from "@/db/schema";
import { getNowInUTC } from "../timeUtil";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "expenses";
const action: ActionType = "create";
const inputZodSchema = expenseInsertSchema.array();

const useExpenseCreate = createMutationHook<
	ExpenseWithMonthlyCLPPriceType[],
	ExpenseInsertType[]
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

export default useExpenseCreate;

function createOptimisticDataEntry(
	oldExpenses: ExpenseWithMonthlyCLPPriceType[] | undefined,
	newExpenses: ExpenseInsertType[],
): ExpenseWithMonthlyCLPPriceType[] {
	return [
		...(oldExpenses || []),
		...newExpenses.map((expense) => ({
			id: (oldExpenses?.at(-1)?.id ?? 99998) + 1,
			created_at: getNowInUTC(),
			last_modified: getNowInUTC(),
			category: expense.category ?? "Administrative",
			type: expense.type ?? "Freelance",
			rate: expense.rate ?? "Monthly",
			name: expense.name ?? "Expense",
			originalPrice: expense.originalPrice ?? 0,
			originalCurrency: expense.originalCurrency ?? "USD",
			clpMonthlyPrice: expense.originalPrice ?? 0,
		})),
	];
}

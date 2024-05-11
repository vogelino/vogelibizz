"use client";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseSelectSchema,
} from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import createQueryFunction from "./createQueryFunction";

type DataType = ExpenseWithMonthlyCLPPriceType;
const resourceName = "expenses";
const action = "querySingle";
const outputZodSchema = expenseSelectSchema;

function useExpense(id?: DataType["id"]) {
	if (!id)
		return {
			data: null,
			isPending: false,
			error: null,
		};
	const queryKey = [resourceName, `${id}`];
	return useSuspenseQuery<DataType>({
		queryKey,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
			id,
		}),
	});
}

export default useExpense;

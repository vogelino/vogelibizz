"use client";
import { useQuery } from "@tanstack/react-query";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseSelectSchema,
} from "@/db/schema";
import createQueryFunction from "./createQueryFunction";

type DataType = ExpenseWithMonthlyCLPPriceType;
const resourceName = "expenses";
const action = "querySingle";
const outputZodSchema = expenseSelectSchema;

function useExpense(id?: DataType["id"]) {
	const queryKey = [resourceName, `${id ?? ""}`];
	return useQuery<DataType>({
		queryKey,
		enabled: Boolean(id),
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
			id: id ?? "",
		}),
	});
}

export default useExpense;

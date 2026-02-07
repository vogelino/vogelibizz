"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
} from "@/db/schema";
import createQueryFunction from "./createQueryFunction";

type DataType = ExpenseWithMonthlyCLPPriceType[];
const resourceName = "expenses";
const action = "queryAll";
const outputZodSchema = expenseWithMonthlyCLPPriceSchema.array();

function useExpenses({ enabled = true }: { enabled?: boolean } = {}) {
	const queryKey = [resourceName];
	return useQuery<DataType>({
		queryKey,
		enabled,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
		}),
	});
}

export default useExpenses;

import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
} from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createQueryFunction } from "./createDataHook";

type DataType = ExpenseWithMonthlyCLPPriceType[];
const resourceName = "expenses";
const action = "queryAll";
const outputZodSchema = expenseWithMonthlyCLPPriceSchema.array();

function useExpenses() {
	const queryKey = [resourceName];
	return useSuspenseQuery<DataType>({
		queryKey,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
		}),
	});
}

export default useExpenses;

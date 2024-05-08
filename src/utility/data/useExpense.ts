import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseSelectSchema,
} from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createQueryFunction } from "./createDataHook";

type DataType = ExpenseWithMonthlyCLPPriceType;
const resourceName = "expenses";
const action = "querySingle";
const outputZodSchema = expenseSelectSchema;

function useExpense(id: DataType["id"]) {
	const queryKey = [resourceName, id];
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

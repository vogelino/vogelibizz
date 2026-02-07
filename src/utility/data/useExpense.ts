"use client";
import { useQuery } from "@tanstack/react-query";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
} from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

type DataType = ExpenseWithMonthlyCLPPriceType;

function useExpense(id?: DataType["id"], initialData?: DataType) {
	const query =
		id === undefined
			? queryKeys.expenses.detail("")
			: queryKeys.expenses.detail(id);
	const queryFn = createQueryFunction<ExpenseWithMonthlyCLPPriceType>({
		resourceName: "expenses",
		action: "querySingle",
		outputZodSchema: expenseWithMonthlyCLPPriceSchema,
		id: id ?? "",
	});
	const initialDataOptions = initialData
		? { initialData, initialDataUpdatedAt: Date.now() }
		: {};
	return useQuery({
		...query,
		queryFn,
		enabled: Boolean(id),
		...initialDataOptions,
	});
}

export default useExpense;

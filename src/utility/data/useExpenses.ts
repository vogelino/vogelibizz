"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
} from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

function useExpenses({ enabled = true }: { enabled?: boolean } = {}) {
	const queryFn = createQueryFunction<ExpenseWithMonthlyCLPPriceType[]>({
		resourceName: "expenses",
		action: "queryAll",
		outputZodSchema: expenseWithMonthlyCLPPriceSchema.array(),
	});
	return useQuery({
		...queryKeys.expenses.list,
		queryFn,
		enabled,
	});
}

export default useExpenses;

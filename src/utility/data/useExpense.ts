"use client";
import { useQuery } from "@tanstack/react-query";
import type { ExpenseWithMonthlyCLPPriceType } from "@/db/schema";
import { expenseQueryOptions } from "@/utility/data/queryOptions";

type DataType = ExpenseWithMonthlyCLPPriceType;

function useExpense(id?: DataType["id"], initialData?: DataType) {
	const initialDataOptions = initialData
		? { initialData, initialDataUpdatedAt: Date.now() }
		: {};
	return useQuery({
		...expenseQueryOptions(id ?? ""),
		enabled: Boolean(id),
		...initialDataOptions,
	});
}

export default useExpense;

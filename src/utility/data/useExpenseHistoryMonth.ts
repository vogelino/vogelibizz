"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { ExpenseHistorySort } from "@/utility/expenseHistoryContracts";
import { expenseHistoryMonthQueryOptions } from "./queryOptions";

export default function useExpenseHistoryMonth(
	month: string | null | undefined,
	sort?: ExpenseHistorySort,
) {
	return useInfiniteQuery({
		...expenseHistoryMonthQueryOptions(month ?? null, sort),
		enabled: month !== undefined,
	});
}

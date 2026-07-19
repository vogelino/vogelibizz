"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { expenseHistoryMonthQueryOptions } from "./queryOptions";

export default function useExpenseHistoryMonth(
	month: string | null | undefined,
) {
	return useInfiniteQuery({
		...expenseHistoryMonthQueryOptions(month ?? null),
		enabled: month !== undefined,
	});
}

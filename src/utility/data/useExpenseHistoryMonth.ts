"use client";

import { useQuery } from "@tanstack/react-query";
import { expenseHistoryMonthQueryOptions } from "./queryOptions";

export default function useExpenseHistoryMonth(month: string | null) {
	return useQuery({
		...expenseHistoryMonthQueryOptions(month ?? ""),
		enabled: month !== null,
	});
}

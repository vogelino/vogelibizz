"use client";

import { useQuery } from "@tanstack/react-query";
import { expenseHistoryMonthsQueryOptions } from "./queryOptions";

export default function useExpenseHistoryMonths() {
	return useQuery(expenseHistoryMonthsQueryOptions());
}

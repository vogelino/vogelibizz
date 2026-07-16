"use client";

import { useQuery } from "@tanstack/react-query";
import { expenseOverviewSummaryQueryOptions } from "./queryOptions";

export default function useExpenseOverviewSummary() {
	return useQuery(expenseOverviewSummaryQueryOptions());
}

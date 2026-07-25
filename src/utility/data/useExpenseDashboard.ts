"use client";

import { useQuery } from "@tanstack/react-query";
import { expenseDashboardQueryOptions } from "./queryOptions";

export default function useExpenseDashboard() {
	return useQuery(expenseDashboardQueryOptions());
}

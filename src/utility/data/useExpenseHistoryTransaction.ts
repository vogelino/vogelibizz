"use client";

import { useQuery } from "@tanstack/react-query";
import { expenseHistoryTransactionQueryOptions } from "./queryOptions";

export default function useExpenseHistoryTransaction(id: number) {
	return useQuery(expenseHistoryTransactionQueryOptions(id));
}

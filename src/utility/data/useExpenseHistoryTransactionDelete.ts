"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "../dataHookUtil";
import {
	expenseHistoryMonthQueriesKey,
	expenseOverviewSummaryQueryOptions,
} from "./queryOptions";

export default function useExpenseHistoryTransactionDelete() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (transactionIds: number[]) => {
			const response = await apiFetch(
				"/api/expense-history/transactions/batch",
				{
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ids: transactionIds }),
				},
			);
			if (!response.ok) {
				const result = (await response.json()) as { error?: string };
				throw new Error(result.error || "Transaction could not be deleted.");
			}
			return transactionIds;
		},
		onSuccess: async (transactionIds) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: expenseHistoryMonthQueriesKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseOverviewSummaryQueryOptions().queryKey,
				}),
			]);
			toast.success(
				transactionIds.length === 1
					? "Transaction deleted."
					: `${transactionIds.length} transactions deleted.`,
			);
		},
		onError: (error) =>
			toast.error("Transaction was not deleted.", {
				description: error.message,
			}),
	});
}

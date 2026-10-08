"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { expenseHistoryTransactionSchema } from "@/utility/expenseHistoryContracts";

import { apiFetch } from "../dataHookUtil";
import {
  expenseDashboardQueryOptions,
  expenseHistoryMonthQueriesKey,
  expenseOverviewSummaryQueryOptions,
} from "./queryOptions";

export default function useExpenseHistoryTransactionDuplicate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await apiFetch(`/api/expense-history/transactions/${transactionId}`, {
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Transaction could not be duplicated.");
      }
      return expenseHistoryTransactionSchema.parse(result);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: expenseHistoryMonthQueriesKey,
        }),
        queryClient.invalidateQueries({
          queryKey: expenseOverviewSummaryQueryOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: expenseDashboardQueryOptions().queryKey,
        }),
      ]);
      toast.success("Transaction duplicated.");
    },
    onError: (error) =>
      toast.error("Transaction was not duplicated.", {
        description: error.message,
      }),
  });
}

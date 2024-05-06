"use client";

import type { ExpenseType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { expensesQueryKey } from "./useExpenses";

function useExpenseEdit() {
  const queryExpense = useQueryClient();
  const deleteMutation = useMutation({
    mutationKey: ["expense-edit"],
    mutationFn: editExpense,
    onMutate: (expense: ExpenseType) => {
      queryExpense.cancelQueries({ queryKey: expensesQueryKey });
      const previousData =
        queryExpense.getQueryData<ExpenseType[]>(expensesQueryKey);
      queryExpense.setQueryData<ExpenseType[]>(expensesQueryKey, (old) =>
        old?.map((c) => {
          if (c.id === expense.id) return expense;
          return c;
        })
      );
      toast.info(
        `Successfully edited expense '${expense.name}' (ID: ${expense.id})`
      );
      return { previousData };
    },
    onError: (err, { id }, context) => {
      queryExpense.setQueryData<ExpenseType[]>(
        expensesQueryKey,
        context?.previousData
      );
      console.error(`Failed to edit expense with id ${id}`, err);
      toast.error(`Failed to edit expense with id ${id}`);
    },
    onSettled: () =>
      queryExpense.invalidateQueries({ queryKey: expensesQueryKey }),
  });

  return deleteMutation;
}

export async function editExpense(expense: ExpenseType) {
  const response = await fetch(
    `${env.client.NEXT_PUBLIC_BASE_URL}/api/expenses/${expense.id}`,
    { method: "PATCH", body: JSON.stringify(expense) }
  );

  const expenseLogDescription = `expense '${expense.name}' (ID: ${expense.id})`;
  if (!response.ok) {
    throw new Error(
      `Failed to edit expense '${expenseLogDescription}: ${response.status} -> ${response.statusText}`
    );
  }

  try {
    const json = await response.json();
    return json as { success: true };
  } catch (err) {
    throw new Error(
      `Failed to parse ${expenseLogDescription}'s json response: ${err}`
    );
  }
}

export default useExpenseEdit;

"use client";

import type { ExpenseType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";
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
				}),
			);
			toast.info(
				`Successfully edited expense '${expense.name}' (ID: ${expense.id})`,
			);
			return { previousData };
		},
		onError: (err, { id }, context) => {
			queryExpense.setQueryData<ExpenseType[]>(
				expensesQueryKey,
				context?.previousData,
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
		{ method: "PATCH", body: JSON.stringify(expense) },
	);

	return handleFetchResponse({
		response,
		crudAction: "delete",
		resourceName: "expenses",
	});
}

export default useExpenseEdit;

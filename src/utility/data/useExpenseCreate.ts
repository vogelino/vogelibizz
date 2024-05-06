"use client";

import type { ExpenseInsertType, ExpenseType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { expensesQueryKey } from "./useExpenses";

function useExpenseCreate() {
	const queryExpense = useQueryClient();
	return useMutation({
		mutationKey: ["expense-create"],
		mutationFn: createExpense,
		onMutate: (expense: ExpenseInsertType) => {
			queryExpense.cancelQueries({ queryKey: expensesQueryKey });
			const previousData =
				queryExpense.getQueryData<ExpenseType[]>(expensesQueryKey);
			queryExpense.setQueryData<ExpenseType[]>(expensesQueryKey, (old) => [
				...(old || []),
				{
					id: (old?.at(-1)?.id ?? 99998) + 1,
					created_at: expense.created_at || new Date().toISOString(),
					last_modified: expense.last_modified || new Date().toISOString(),
					category: expense.category ?? "Administrative",
					type: expense.type ?? "Freelance",
					rate: expense.rate ?? "Monthly",
					name: expense.name ?? "Expense",
					price: expense.price ?? 0,
					original_currency: expense.original_currency ?? "USD",
				},
			]);
			toast.info(`Successfully created expense '${expense.name}'`);
			return { previousData };
		},
		onError: (err, { name }, context) => {
			queryExpense.setQueryData<ExpenseType[]>(
				expensesQueryKey,
				context?.previousData,
			);
			console.error(`Failed to create expense with name '${name}'`, err);
			toast.error(`Failed to create expense with name '${name}'`);
		},
		onSettled: () =>
			queryExpense.invalidateQueries({ queryKey: expensesQueryKey }),
	});
}

export async function createExpense(expense: ExpenseInsertType) {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/expenses`,
		{ method: "POST", body: JSON.stringify([expense]) },
	);

	const expenseLogDescription = `expense '${expense.name}'`;
	if (!response.ok) {
		throw new Error(
			`Failed to create expense '${expenseLogDescription}: ${response.status} -> ${response.statusText}`,
		);
	}

	try {
		const json = await response.json();
		return json as { success: true };
	} catch (err) {
		throw new Error(
			`Failed to parse ${expenseLogDescription}'s json response: ${err}`,
		);
	}
}

export default useExpenseCreate;

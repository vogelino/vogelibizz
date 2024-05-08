"use client";

import type { ExpenseInsertType, ExpenseType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";

const expensesQueryKey = ["expenses"];
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
					originalPrice: expense.originalPrice ?? 0,
					originalCurrency: expense.originalCurrency ?? "USD",
				},
			]);
			return { previousData };
		},
		onSuccess: (_msg, expense) => {
			toast.info(`Successfully created expense '${expense.name}'`);
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

	return handleFetchResponse({
		response,
		crudAction: "create",
		resourceName: "clients",
	});
}

export default useExpenseCreate;

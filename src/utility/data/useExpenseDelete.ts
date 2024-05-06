"use client";

import type { ExpenseType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesQueryKey } from "./useExpenses";

function useExpenseDelete() {
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationKey: ["expense-delete"],
		mutationFn: deleteClientApi,
		onMutate: (id: number) => {
			queryClient.cancelQueries({ queryKey: expensesQueryKey });
			const previousData =
				queryClient.getQueryData<ExpenseType[]>(expensesQueryKey);
			queryClient.setQueryData<ExpenseType[]>(expensesQueryKey, (old) =>
				old?.filter((c) => c.id !== id),
			);
			return { previousData };
		},
		onError: (err, id, context) => {
			queryClient.setQueryData<ExpenseType[]>(
				expensesQueryKey,
				context?.previousData,
			);
			console.error(`Failed to delete expense with id ${id}`, err);
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: expensesQueryKey }),
	});

	return deleteMutation;
}

export async function deleteClientApi(id: number) {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/expenses/${id}`,
		{ method: "DELETE" },
	);
	const json = await response.json();

	return json;
}

export default useExpenseDelete;

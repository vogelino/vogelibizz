"use client";

import type { ExpenseType } from "@/db/schema";
import env from "@/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleFetchResponse } from "../dataHookUtil";
import { expensesQueryKey } from "./useExpenses";

function useExpenseDelete() {
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationKey: ["expense-delete"],
		mutationFn: deleteExpense,
		onMutate: (id: number) => {
			queryClient.cancelQueries({ queryKey: expensesQueryKey });
			const previousData =
				queryClient.getQueryData<ExpenseType[]>(expensesQueryKey);
			queryClient.setQueryData<ExpenseType[]>(expensesQueryKey, (old) =>
				old?.filter((c) => c.id !== id),
			);
			return { previousData };
		},
		onSuccess: (_data, id) => {
			toast.info(`Successfully deleted expense with "${id}"`);
		},
		onError: (err, id, context) => {
			queryClient.setQueryData<ExpenseType[]>(
				expensesQueryKey,
				context?.previousData,
			);
			console.error(`Failed to delete expense with id ${id}`, err);
			toast.error(`Failed to delete expense with id ${id}: ${err}`);
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: expensesQueryKey }),
	});

	return deleteMutation;
}

export async function deleteExpense(id: number) {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/expenses/${id}`,
		{ method: "DELETE" },
	);

	return handleFetchResponse({
		response,
		data: id,
		crudAction: "delete",
		resourceName: "expenses",
	});
}

export default useExpenseDelete;

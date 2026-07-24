"use client";

import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type {
	ExpenseHistoryCreateExpense,
	ExpenseHistoryMonthDetail,
	ExpenseHistoryTransaction,
	ExpenseHistoryTransactionMutation,
} from "@/utility/expenseHistoryContracts";
import { expenseHistoryTransactionSchema } from "@/utility/expenseHistoryContracts";
import { apiFetch } from "../dataHookUtil";
import {
	expenseHistoryMonthQueriesKey,
	expenseHistoryTransactionQueryOptions,
	expenseOverviewSummaryQueryOptions,
	expensesQueryOptions,
} from "./queryOptions";

class ExpenseHistoryMutationError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
	}
}

async function mutateTransaction(
	transactionId: number,
	body: ExpenseHistoryTransactionMutation | ExpenseHistoryCreateExpense,
	createExpense: boolean,
) {
	const response = await apiFetch(
		`/api/expense-history/transactions/${transactionId}${createExpense ? "/expense" : ""}`,
		{
			method: createExpense ? "POST" : "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		},
	);
	const result = (await response.json()) as { error?: string };
	if (!response.ok) {
		throw new ExpenseHistoryMutationError(
			result.error || `Mutation failed (${response.status}).`,
			response.status,
		);
	}
	return expenseHistoryTransactionSchema.parse(result);
}

export function useExpenseHistoryTransactionMutations({
	transactionId,
}: {
	transactionId: number;
	month: string;
}) {
	const queryClient = useQueryClient();
	const refresh = async (created: boolean) => {
		const invalidations = [
			queryClient.invalidateQueries({
				queryKey: expenseHistoryTransactionQueryOptions(transactionId).queryKey,
			}),
			queryClient.invalidateQueries({
				queryKey: expenseHistoryMonthQueriesKey,
			}),
			queryClient.invalidateQueries({
				queryKey: expenseOverviewSummaryQueryOptions().queryKey,
			}),
		];
		if (created) {
			invalidations.push(
				queryClient.invalidateQueries({
					queryKey: expensesQueryOptions().queryKey,
				}),
			);
		}
		await Promise.all(invalidations);
	};
	const handleError = async (
		error: Error,
		created: boolean,
		fallback: string,
	) => {
		toast.error(
			error instanceof ExpenseHistoryMutationError && error.status === 409
				? "Transaction changed elsewhere."
				: fallback,
			{ description: error.message },
		);
		await refresh(created);
	};

	const update = useMutation({
		mutationFn: (body: ExpenseHistoryTransactionMutation) =>
			mutateTransaction(transactionId, body, false),
		onSuccess: async () => {
			toast.success("Transaction saved.");
			await refresh(false);
		},
		onError: (error) => handleError(error, false, "Transaction was not saved."),
	});
	const createExpense = useMutation({
		mutationFn: (body: ExpenseHistoryCreateExpense) =>
			mutateTransaction(transactionId, body, true),
		onSuccess: async () => {
			toast.success("Recurring expense created and associated.");
			await refresh(true);
		},
		onError: (error) =>
			handleError(error, true, "Recurring expense was not created."),
	});

	return { update, createExpense };
}

type InlineTransactionEdit = {
	transaction: ExpenseHistoryTransaction;
	change: Omit<ExpenseHistoryTransactionMutation, "lastModified">;
	optimisticChange?: Partial<ExpenseHistoryTransaction>;
};

export function useExpenseHistoryTransactionInlineEdit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ transaction, change }: InlineTransactionEdit) =>
			mutateTransaction(
				transaction.id,
				{ lastModified: transaction.lastModified, ...change },
				false,
			),
		onMutate: async ({ transaction, change, optimisticChange }) => {
			await queryClient.cancelQueries({
				queryKey: expenseHistoryMonthQueriesKey,
			});
			const previous = queryClient.getQueriesData<
				InfiniteData<ExpenseHistoryMonthDetail, number>
			>({ queryKey: expenseHistoryMonthQueriesKey });
			queryClient.setQueriesData<
				InfiniteData<ExpenseHistoryMonthDetail, number>
			>({ queryKey: expenseHistoryMonthQueriesKey }, (old) => {
				if (!old) return old;
				const nextChange = optimisticChange ?? change;
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						transactions: page.transactions.map((item) =>
							item.id === transaction.id
								? {
										...item,
										...nextChange,
										lastModified: new Date().toISOString(),
									}
								: item,
						),
					})),
				};
			});
			return { previous };
		},
		onSuccess: () => {
			toast.success("Transaction saved.");
		},
		onError: (error, _variables, context) => {
			for (const [queryKey, data] of context?.previous ?? []) {
				queryClient.setQueryData(queryKey, data);
			}
			toast.error("Transaction was not saved.", {
				description: error.message,
			});
		},
		onSettled: async (_data, _error, { transaction }) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: expenseHistoryTransactionQueryOptions(transaction.id)
						.queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseHistoryMonthQueriesKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseOverviewSummaryQueryOptions().queryKey,
				}),
			]);
		},
	});
}

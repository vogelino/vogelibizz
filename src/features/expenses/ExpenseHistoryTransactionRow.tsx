"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
	type ExpenseType,
	expenseCategoryEnum,
	expenseTypeEnum,
} from "@/db/schema";
import {
	expenseHistoryMonthQueryOptions,
	expensesQueryOptions,
} from "@/utility/data/queryOptions";
import useExpenses from "@/utility/data/useExpenses";
import { apiFetch } from "@/utility/dataHookUtil";
import {
	type ExpenseHistoryTransaction,
	expenseHistoryTransactionSchema,
} from "@/utility/expenseHistoryContracts";
import { formatCurrency, locale } from "@/utility/formatUtil";

function formatDate(date: string) {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

async function mutateTransaction(
	transactionId: number,
	body: Record<string, unknown>,
	createExpense = false,
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
	if (!response.ok)
		throw new Error(result.error || `Mutation failed (${response.status}).`);
	return expenseHistoryTransactionSchema.parse(result);
}

export function ExpenseHistoryTransactionRow({
	transaction,
	month,
}: {
	transaction: ExpenseHistoryTransaction;
	month: string;
}) {
	const queryClient = useQueryClient();
	const { data: expenses = [] } = useExpenses();
	const [description, setDescription] = useState(transaction.description);
	const [amount, setAmount] = useState(String(transaction.amount));
	const [category, setCategory] = useState(transaction.category ?? "");
	const [type, setType] = useState(transaction.type ?? "");
	const [association, setAssociation] = useState(
		transaction.expense?.name ?? "",
	);
	const [createOpen, setCreateOpen] = useState(false);
	useEffect(() => {
		setDescription(transaction.description);
		setAmount(String(transaction.amount));
		setCategory(transaction.category ?? "");
		setType(transaction.type ?? "");
		setAssociation(transaction.expense?.name ?? "");
	}, [transaction]);

	const refresh = async (created = false) => {
		const invalidations = [
			queryClient.invalidateQueries({
				queryKey: expenseHistoryMonthQueryOptions(month).queryKey,
			}),
		];
		if (created)
			invalidations.push(
				queryClient.invalidateQueries({
					queryKey: expensesQueryOptions().queryKey,
				}),
			);
		await Promise.all(invalidations);
	};
	const mutation = useMutation({
		mutationFn: (body: Record<string, unknown>) =>
			mutateTransaction(transaction.id, body),
		onSuccess: async () => {
			toast.success("Transaction saved.");
			await refresh();
		},
		onError: async (error) => {
			toast.error("Transaction was not saved.", { description: error.message });
			await refresh();
		},
	});
	const createMutation = useMutation({
		mutationFn: () =>
			mutateTransaction(
				transaction.id,
				{
					lastModified: transaction.lastModified,
					name: description.trim(),
					originalPrice: Number(amount),
					category: category as ExpenseType["category"],
					type: type as ExpenseType["type"],
				},
				true,
			),
		onSuccess: async () => {
			setCreateOpen(false);
			toast.success("Recurring expense created and associated.");
			await refresh(true);
		},
		onError: async (error) => {
			toast.error("Recurring expense was not created.", {
				description: error.message,
			});
			await refresh(true);
		},
	});
	const pending = mutation.isPending || createMutation.isPending;
	const save = () =>
		mutation.mutate({
			lastModified: transaction.lastModified,
			description: description.trim(),
			amount: Number(amount),
			category: category || null,
			type: type || null,
		});
	const associate = () => {
		const match = expenses.find(
			(expense) =>
				expense.name.toLocaleLowerCase() ===
				association.trim().toLocaleLowerCase(),
		);
		if (!match) {
			toast.error(
				"Choose an existing recurring expense from the searchable list.",
			);
			return;
		}
		mutation.mutate({
			lastModified: transaction.lastModified,
			expenseId: match.id,
		});
	};

	return (
		<TableRow>
			<TableCell>{formatDate(transaction.bookedAt)}</TableCell>
			<TableCell className="min-w-64 align-top">
				<label className="sr-only" htmlFor={`description-${transaction.id}`}>
					Editable description
				</label>
				<input
					id={`description-${transaction.id}`}
					className="form-input w-full"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					disabled={pending}
				/>
				<details className="mt-1 text-xs text-muted-foreground">
					<summary className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						Original bank details
					</summary>
					<div className="mt-1 max-w-xl whitespace-normal">
						{transaction.originalDescription} ·{" "}
						{formatCurrency(transaction.originalAmount, "CHF")}
						{transaction.valueDate
							? ` · Value date ${formatDate(transaction.valueDate)}`
							: ""}
					</div>
				</details>
			</TableCell>
			<TableCell className="min-w-36 align-top">
				<label className="sr-only" htmlFor={`amount-${transaction.id}`}>
					Effective CHF amount
				</label>
				<input
					id={`amount-${transaction.id}`}
					type="number"
					min="0"
					step="0.01"
					className="form-input w-full text-right font-mono"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					disabled={pending}
				/>
			</TableCell>
			<TableCell className="min-w-64 align-top">
				{transaction.expense ? (
					<div className="flex items-center gap-2">
						<span>{transaction.expense.name}</span>
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={pending}
							onClick={() =>
								mutation.mutate({
									lastModified: transaction.lastModified,
									expenseId: null,
								})
							}
						>
							Detach
						</Button>
					</div>
				) : (
					<Badge variant="secondary">Other</Badge>
				)}
				{!transaction.expense && (
					<div className="mt-2 flex gap-2">
						<label
							className="sr-only"
							htmlFor={`association-${transaction.id}`}
						>
							Search recurring expenses
						</label>
						<input
							id={`association-${transaction.id}`}
							list={`expense-options-${transaction.id}`}
							className="form-input min-w-0 flex-1"
							placeholder="Search recurring expenses"
							value={association}
							onChange={(e) => setAssociation(e.target.value)}
						/>
						<datalist id={`expense-options-${transaction.id}`}>
							{expenses.map((expense) => (
								<option key={expense.id} value={expense.name} />
							))}
						</datalist>
						<Button
							type="button"
							size="sm"
							disabled={pending}
							onClick={associate}
						>
							Associate
						</Button>
					</div>
				)}
				{!transaction.expense && (
					<details
						className="mt-2"
						open={createOpen}
						onToggle={(e) => setCreateOpen(e.currentTarget.open)}
					>
						<summary className="cursor-pointer text-sm underline">
							Create recurring expense
						</summary>
						<div className="mt-2 space-y-2 border border-border p-2 text-xs">
							<p>
								Name, CHF amount, Category and Type use the editable values
								above. Billing frequency is Monthly and currency is CHF.
							</p>
							<Button
								type="button"
								size="sm"
								disabled={
									pending ||
									!description.trim() ||
									!category ||
									!type ||
									!Number.isFinite(Number(amount)) ||
									Number(amount) < 0
								}
								onClick={() => createMutation.mutate()}
							>
								Create and associate
							</Button>
						</div>
					</details>
				)}
			</TableCell>
			<TableCell className="min-w-48 align-top">
				<label className="sr-only" htmlFor={`category-${transaction.id}`}>
					Category
				</label>
				<select
					id={`category-${transaction.id}`}
					className="form-select w-full"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					disabled={pending}
				>
					<option value="">Unclassified</option>
					{expenseCategoryEnum.enumValues.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</TableCell>
			<TableCell className="min-w-40 align-top">
				<label className="sr-only" htmlFor={`type-${transaction.id}`}>
					Type
				</label>
				<select
					id={`type-${transaction.id}`}
					className="form-select w-full"
					value={type}
					onChange={(e) => setType(e.target.value)}
					disabled={pending}
				>
					<option value="">Unclassified</option>
					{expenseTypeEnum.enumValues.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
				<Button
					type="button"
					size="sm"
					className="mt-2 w-full"
					disabled={
						pending ||
						!description.trim() ||
						amount === "" ||
						!Number.isFinite(Number(amount)) ||
						Number(amount) < 0
					}
					onClick={save}
				>
					{pending ? "Saving…" : "Save edits"}
				</Button>
			</TableCell>
		</TableRow>
	);
}

"use client";

import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Button } from "@/components/ui/button";
import CurrencyInput from "@/components/ui/currency-input";
import type { ExpenseType } from "@/db/schema";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import useExpenseHistoryTransaction from "@/utility/data/useExpenseHistoryTransaction";
import { useExpenseHistoryTransactionMutations } from "@/utility/data/useExpenseHistoryTransactionMutations";
import useExpenses from "@/utility/data/useExpenses";
import { mapTypeToIcon } from "@/utility/expensesIconUtil";
import { formatCurrency, locale } from "@/utility/formatUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";

function formatDate(date: string) {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

export default function ExpenseHistoryTransactionEditor({
	id,
	formId,
	onSaved,
}: {
	id: number;
	formId: string;
	onSaved?: (month: string) => void;
}) {
	const detailQuery = useExpenseHistoryTransaction(id);
	const { data: expenses = [], isPending: expensesPending } = useExpenses();
	const detail = detailQuery.data;
	const transaction = detail?.transaction;
	const mutations = useExpenseHistoryTransactionMutations({
		transactionId: id,
		month: detail?.month ?? "",
	});
	const form = useForm({
		defaultValues: {
			description: transaction?.description ?? "",
			amount: transaction?.amount ?? 0,
			category: transaction?.category ?? "",
			type: transaction?.type ?? "",
			expenseId: transaction?.expense?.id ? String(transaction.expense.id) : "",
		},
		onSubmit: async ({ value }) => {
			if (!transaction || !detail) return;
			const previousExpenseId = transaction.expense
				? String(transaction.expense.id)
				: "";
			const associationChanged = value.expenseId !== previousExpenseId;
			try {
				await mutations.update.mutateAsync({
					lastModified: transaction.lastModified,
					description: value.description.trim(),
					amount: value.amount,
					...(associationChanged && value.expenseId
						? { expenseId: Number(value.expenseId) }
						: {
								...(associationChanged ? { expenseId: null } : {}),
								category: (value.category || null) as
									| ExpenseType["category"]
									| null,
								type: (value.type || null) as ExpenseType["type"] | null,
							}),
				});
				onSaved?.(detail.month);
			} catch {
				// The mutation hook presents and safely refetches every failure.
			}
		},
	});

	useEffect(() => {
		if (!transaction) return;
		form.reset({
			description: transaction.description,
			amount: transaction.amount,
			category: transaction.category ?? "",
			type: transaction.type ?? "",
			expenseId: transaction.expense ? String(transaction.expense.id) : "",
		});
	}, [form, transaction]);

	const categoryOptions = useComboboxOptions({
		optionValues: ["", ...expenseCategoryEnum.enumValues],
		renderer: (category) =>
			category ? (
				<ExpenseCategoryBadge value={category as ExpenseType["category"]} />
			) : (
				<span className="italic text-muted-foreground">Unclassified</span>
			),
	});
	const typeOptions = useComboboxOptions({
		optionValues: ["", ...expenseTypeEnum.enumValues],
		renderer: (type) =>
			type ? (
				<>
					{mapTypeToIcon(type as ExpenseType["type"], 24)}
					<span>{type}</span>
				</>
			) : (
				<span className="italic text-muted-foreground">Unclassified</span>
			),
	});
	const expenseOptions = useMemo(
		() => [
			{
				label: <span className="italic text-muted-foreground">Other</span>,
				value: "",
			},
			...expenses.map((expense) => ({
				label: <span>{expense.name}</span>,
				value: String(expense.id),
			})),
		],
		[expenses],
	);

	if (detailQuery.isPending) {
		return <output>Loading transaction…</output>;
	}
	if (detailQuery.error || !transaction || !detail) {
		return (
			<div role="alert">
				Transaction could not be loaded. {detailQuery.error?.message}
			</div>
		);
	}
	const pending = mutations.update.isPending;

	return (
		<form
			id={formId}
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
			className="space-y-6"
		>
			<div className="grid gap-4 border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
				<div>
					<span className="text-muted-foreground">Booked</span>
					<p>{formatDate(transaction.bookedAt)}</p>
				</div>
				<div>
					<span className="text-muted-foreground">Original amount</span>
					<p>{formatCurrency(transaction.originalAmount, "CHF")}</p>
				</div>
				<div className="sm:col-span-2">
					<span className="text-muted-foreground">Original description</span>
					<p>{transaction.originalDescription}</p>
				</div>
			</div>

			<form.Field
				name="description"
				validators={{
					onSubmit: ({ value }) =>
						value.trim() ? undefined : "Description is required.",
				}}
			>
				{(field) => (
					<FormInputWrapper
						label={<label htmlFor={field.name}>Description</label>}
						error={field.state.meta.errors[0]?.toString()}
					>
						<input
							id={field.name}
							name={field.name}
							className="form-input dark:bg-card"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={pending}
						/>
					</FormInputWrapper>
				)}
			</form.Field>

			<form.Field
				name="amount"
				validators={{
					onSubmit: ({ value }) =>
						Number.isFinite(value) && value >= 0
							? undefined
							: "Amount must be CHF 0 or greater.",
				}}
			>
				{(field) => (
					<CurrencyInput
						label="Effective amount"
						currency="CHF"
						currencyReadOnly
						value={field.state.value}
						onCurrencyChange={() => undefined}
						onValueChange={field.handleChange}
						inputProps={{
							name: field.name,
							onBlur: field.handleBlur,
							disabled: pending,
						}}
					/>
				)}
			</form.Field>

			<div className="grid gap-6 sm:grid-cols-2">
				<form.Field name="category">
					{(field) => (
						<FormInputCombobox
							label="Category"
							options={categoryOptions}
							value={field.state.value}
							onChange={(value) => field.handleChange(String(value))}
							className="w-full"
							disabled={pending}
						/>
					)}
				</form.Field>
				<form.Field name="type">
					{(field) => (
						<FormInputCombobox
							label="Type"
							options={typeOptions}
							value={field.state.value}
							onChange={(value) => field.handleChange(String(value))}
							className="w-full"
							disabled={pending}
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="expenseId">
				{(field) => (
					<FormInputCombobox
						label="Recurring expense association"
						options={expenseOptions}
						value={field.state.value}
						onChange={(value) => field.handleChange(String(value))}
						className="w-full"
						loading={expensesPending}
						disabled={pending}
					/>
				)}
			</form.Field>

			{!transaction.expense ? (
				<div className="border border-border bg-muted/30 p-4">
					<p className="text-sm text-muted-foreground">
						Create a Monthly CHF recurring expense from this transaction and
						associate it atomically.
					</p>
					<Button asChild type="button" variant="outline" className="mt-3">
						<Link
							to="/expenses/history/create-expense/$id/modal"
							params={{ id: String(id) }}
							search={{ month: detail.month }}
							mask={{
								to: "/expenses/history/create-expense/$id",
								params: { id: String(id) },
								unmaskOnReload: true,
							}}
						>
							Create recurring expense
						</Link>
					</Button>
				</div>
			) : null}

			{mutations.update.error ? (
				<p role="alert" className="text-sm text-destructive">
					{mutations.update.error.message}
				</p>
			) : null}
		</form>
	);
}

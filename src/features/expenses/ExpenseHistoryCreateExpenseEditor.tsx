"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Badge } from "@/components/ui/badge";
import CurrencyInput from "@/components/ui/currency-input";
import type { ExpenseType } from "@/db/schema";
import {
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";
import useExpenseHistoryTransaction from "@/utility/data/useExpenseHistoryTransaction";
import { useExpenseHistoryTransactionMutations } from "@/utility/data/useExpenseHistoryTransactionMutations";
import { mapTypeToIcon } from "@/utility/expensesIconUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";

export default function ExpenseHistoryCreateExpenseEditor({
	id,
	formId,
	onCreated,
}: {
	id: number;
	formId: string;
	onCreated?: (month: string) => void;
}) {
	const detailQuery = useExpenseHistoryTransaction(id);
	const detail = detailQuery.data;
	const transaction = detail?.transaction;
	const mutations = useExpenseHistoryTransactionMutations({
		transactionId: id,
		month: detail?.month ?? "",
	});
	const form = useForm({
		defaultValues: {
			name: transaction?.description ?? "",
			originalPrice: transaction?.amount ?? 0,
			originalCurrency: "CHF" as ExpenseType["originalCurrency"],
			rate: "Monthly" as ExpenseType["rate"],
			category: transaction?.category ?? "",
			type: transaction?.type ?? "",
		},
		onSubmit: async ({ value }) => {
			if (!transaction || !detail || !value.category || !value.type) return;
			try {
				await mutations.createExpense.mutateAsync({
					lastModified: transaction.lastModified,
					name: value.name.trim(),
					originalPrice: value.originalPrice,
					originalCurrency: value.originalCurrency,
					rate: value.rate,
					category: value.category as ExpenseType["category"],
					type: value.type as ExpenseType["type"],
				});
				onCreated?.(detail.month);
			} catch {
				// The mutation hook presents and safely refetches every failure.
			}
		},
	});

	useEffect(() => {
		if (!transaction) return;
		form.reset({
			name: transaction.description,
			originalPrice: transaction.amount,
			originalCurrency: "CHF",
			rate: "Monthly",
			category: transaction.category ?? "",
			type: transaction.type ?? "",
		});
	}, [form, transaction]);

	const categoryOptions = useComboboxOptions({
		optionValues: ["", ...expenseCategoryEnum.enumValues],
		renderer: (category) =>
			category ? (
				<ExpenseCategoryBadge value={category as ExpenseType["category"]} />
			) : (
				<Badge variant="outline">Choose category</Badge>
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
				<Badge variant="outline">Choose type</Badge>
			),
	});
	const rateOptions = useComboboxOptions<ExpenseType["rate"]>({
		optionValues: expenseRateEnum.enumValues,
	});

	if (detailQuery.isPending) return <output>Loading transaction…</output>;
	if (detailQuery.error || !transaction || !detail) {
		return (
			<div role="alert">
				Transaction could not be loaded. {detailQuery.error?.message}
			</div>
		);
	}
	if (transaction.expense) {
		return (
			<div role="alert">
				This transaction is already associated with {transaction.expense.name}.
			</div>
		);
	}
	const pending = mutations.createExpense.isPending;

	return (
		<form
			id={formId}
			className="space-y-6"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<p className="text-sm text-muted-foreground">
				Set the amount for each payment and how often you pay it. The new
				expense will be linked to this transaction.
			</p>
			<form.Field
				name="name"
				validators={{
					onSubmit: ({ value }) =>
						value.trim() ? undefined : "Name is required.",
				}}
			>
				{(field) => (
					<FormInputWrapper
						label={<label htmlFor={field.name}>Name</label>}
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
			<form.Field name="originalCurrency">
				{(currencyField) => (
					<form.Field
						name="originalPrice"
						validators={{
							onSubmit: ({ value }) =>
								Number.isFinite(value) && value >= 0
									? undefined
									: "Amount must be 0 or greater.",
						}}
					>
						{(priceField) => (
							<CurrencyInput
								label="Amount per payment"
								currency={currencyField.state.value}
								value={priceField.state.value}
								onCurrencyChange={currencyField.handleChange}
								onValueChange={priceField.handleChange}
								inputProps={{
									name: priceField.name,
									onBlur: priceField.handleBlur,
									disabled: pending,
								}}
							/>
						)}
					</form.Field>
				)}
			</form.Field>
			<form.Field name="rate">
				{(field) => (
					<FormInputCombobox
						label="Billing frequency"
						options={rateOptions}
						value={field.state.value}
						onChange={(value) =>
							field.handleChange(value as ExpenseType["rate"])
						}
						className="w-full"
						disabled={pending}
					/>
				)}
			</form.Field>
			<div className="grid gap-6 sm:grid-cols-2">
				<form.Field
					name="category"
					validators={{
						onSubmit: ({ value }) =>
							value ? undefined : "Category is required.",
					}}
				>
					{(field) => (
						<FormInputCombobox
							label="Category"
							options={categoryOptions}
							value={field.state.value}
							onChange={(value) => field.handleChange(String(value))}
							error={field.state.meta.errors[0]?.toString()}
							className="w-full"
							disabled={pending}
						/>
					)}
				</form.Field>
				<form.Field
					name="type"
					validators={{
						onSubmit: ({ value }) => (value ? undefined : "Type is required."),
					}}
				>
					{(field) => (
						<FormInputCombobox
							label="Type"
							options={typeOptions}
							value={field.state.value}
							onChange={(value) => field.handleChange(String(value))}
							error={field.state.meta.errors[0]?.toString()}
							className="w-full"
							disabled={pending}
						/>
					)}
				</form.Field>
			</div>
			{mutations.createExpense.error ? (
				<p role="alert" className="text-sm text-destructive">
					{mutations.createExpense.error.message}
				</p>
			) : null}
		</form>
	);
}

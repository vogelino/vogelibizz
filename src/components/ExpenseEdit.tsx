"use client";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExpenseCategoryLabel } from "@/components/ExpenseCategoryBadge";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import CurrencyInput from "@/components/ui/currency-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ExpenseType,
	type ExpenseWithMonthlyCLPPriceType,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";
import {
	commonValue,
	hasCommonValue,
	pickChanged,
	runBulkEditsSequentially,
} from "@/utility/bulkEdit";
import useExpense from "@/utility/data/useExpense";
import useExpenseCreate from "@/utility/data/useExpenseCreate";
import useExpenseEdit from "@/utility/data/useExpenseEdit";
import { mapTypeToIcon } from "@/utility/expensesIconUtil";
import { getNowInUTC } from "@/utility/timeUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";

export default function ExpenseEdit({
	id,
	formId,
	initialData,
	bulkItems,
	onBulkComplete,
	loading = false,
}: {
	id?: number;
	formId: string;
	initialData?: ExpenseWithMonthlyCLPPriceType;
	bulkItems?: ExpenseWithMonthlyCLPPriceType[];
	onBulkComplete?: () => void;
	loading?: boolean;
}) {
	const isBulk = Boolean(bulkItems?.length);
	const changedFields = useRef(
		new Set<
			| "name"
			| "type"
			| "category"
			| "rate"
			| "originalPrice"
			| "originalCurrency"
		>(),
	);
	const editMutation = useExpenseEdit();
	const createMutation = useExpenseCreate();
	const expenseQuery = useExpense(id, id ? initialData : undefined);
	const bulkExpense = useMemo(() => {
		if (!bulkItems?.length) return undefined;
		return {
			...bulkItems[0],
			name: commonValue(bulkItems, "name") ?? "",
			type: commonValue(bulkItems, "type") ?? ("" as ExpenseType["type"]),
			category:
				commonValue(bulkItems, "category") ?? ("" as ExpenseType["category"]),
			rate: commonValue(bulkItems, "rate") ?? ("" as ExpenseType["rate"]),
			originalPrice: commonValue(bulkItems, "originalPrice"),
			originalCurrency:
				commonValue(bulkItems, "originalCurrency") ??
				("" as ExpenseType["originalCurrency"]),
		};
	}, [bulkItems]);
	const expense = isBulk ? bulkExpense : id ? expenseQuery.data : initialData;
	const mixed = (key: keyof ExpenseType) =>
		Boolean(isBulk && bulkItems && !hasCommonValue(bulkItems, key));
	const navigate = useNavigate();
	const isLoading = loading || (Boolean(id) && !expense);
	const [type, setType] = useState(expense?.type ?? "Freelance");
	const [category, setCategory] = useState(
		expense?.category ?? "Administrative",
	);
	const [rate, setRate] = useState(expense?.rate ?? "Monthly");
	const [originalPrice, setOriginalPrice] = useState(
		expense?.originalPrice ?? (isBulk ? undefined : 0),
	);
	const [originalCurrency, setOriginalCurrency] = useState(
		expense?.originalCurrency ?? "USD",
	);

	const form = useForm({
		defaultValues: {
			name: expense?.name ?? "",
		},
		onSubmit: async ({ value }) => {
			const expenseData = {
				name: value.name,
				type,
				category,
				rate,
				originalPrice: originalPrice ?? 0,
				originalCurrency,
			};
			if (isBulk && bulkItems) {
				const changes = pickChanged(expenseData, changedFields.current);
				await runBulkEditsSequentially(bulkItems, async (item) => {
					const {
						clpMonthlyPrice: _clpMonthlyPrice,
						created_at: _createdAt,
						last_modified: _lastModified,
						...editableItem
					} = item;
					await editMutation.mutateAsync({
						...editableItem,
						...changes,
						id: item.id,
					});
				});
				onBulkComplete?.();
				return;
			}
			navigate({
				to: "/expenses",
				search: (previous) => ({ ...previous, duplicateId: undefined }),
			});
			if (id) {
				editMutation.mutate({
					...expenseData,
					id,
					last_modified: getNowInUTC(),
				});
			} else createMutation.mutate([expenseData]);
		},
	});

	useEffect(() => {
		if (!expense) return;
		changedFields.current.clear();
		setType(expense.type ?? "Freelance");
		setCategory(expense.category ?? "Administrative");
		setRate(expense.rate ?? "Monthly");
		setOriginalPrice(expense.originalPrice ?? (isBulk ? undefined : 0));
		setOriginalCurrency(expense.originalCurrency ?? "USD");
		form.setFieldValue("name", expense.name ?? "");
	}, [expense, form.setFieldValue, isBulk]);

	const categoryOptions = useComboboxOptions({
		optionValues: expenseCategoryEnum.enumValues,
		renderer: (cat) => <ExpenseCategoryLabel value={cat} />,
		accessorFn: (cat) => cat,
	});

	const typeOptions = useComboboxOptions<ExpenseType["type"]>({
		optionValues: expenseTypeEnum.enumValues,
		renderer: (type) => (
			<>
				{mapTypeToIcon(type, 24)}
				<span>{type}</span>
			</>
		),
	});

	const rateOptions = useComboboxOptions<ExpenseType["rate"]>({
		optionValues: expenseRateEnum.enumValues,
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			id={formId}
			className="@container"
		>
			<div className="flex flex-col gap-6">
				<form.Field
					name="name"
					validators={{
						onSubmit: ({ value }) =>
							!value && (!isBulk || changedFields.current.has("name"))
								? "This field is required"
								: undefined,
					}}
				>
					{(field) => (
						<FormInputWrapper
							label="Name"
							error={field.state.meta.errors[0]?.toString()}
							loading={isLoading}
							loadingChildren={<Skeleton className="h-9 w-full" />}
						>
							{!isLoading && (
								<input
									className="form-input dark:bg-card"
									placeholder={
										mixed("name") ? "Multiple values" : "Expense name"
									}
									type="text"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => {
										changedFields.current.add("name");
										field.handleChange(e.target.value);
									}}
									// biome-ignore lint/a11y/noAutofocus: intentional focus on modal open
									autoFocus
								/>
							)}
						</FormInputWrapper>
					)}
				</form.Field>
				<div className="grid @md:grid-cols-2 gap-6">
					<FormInputCombobox
						options={categoryOptions}
						label="Category"
						value={category}
						placeholder={mixed("category") ? "Multiple values" : undefined}
						onChange={(val) => {
							changedFields.current.add("category");
							setCategory(val as ExpenseType["category"]);
						}}
						className="w-full"
						loading={isLoading}
					/>
					<FormInputCombobox
						options={typeOptions}
						label="Type"
						value={type}
						placeholder={mixed("type") ? "Multiple values" : undefined}
						onChange={(val) => {
							changedFields.current.add("type");
							setType(val as ExpenseType["type"]);
						}}
						className="w-full"
						loading={isLoading}
					/>
					<CurrencyInput
						label="Original price"
						onCurrencyChange={(value) => {
							changedFields.current.add("originalCurrency");
							setOriginalCurrency(value);
						}}
						onValueChange={(value) => {
							changedFields.current.add("originalPrice");
							setOriginalPrice(value);
						}}
						onValueClear={
							isBulk
								? () => {
										changedFields.current.delete("originalPrice");
										setOriginalPrice(bulkExpense?.originalPrice);
									}
								: undefined
						}
						currency={originalCurrency}
						value={originalPrice}
						inputProps={{
							placeholder: mixed("originalPrice") ? "Multiple values" : "0.00",
							required: !isBulk,
						}}
						currencyPlaceholder={
							mixed("originalCurrency") ? "Multiple values" : undefined
						}
						loading={isLoading}
					/>
					<FormInputCombobox
						options={rateOptions}
						label="Billing Rate"
						value={rate}
						placeholder={mixed("rate") ? "Multiple values" : undefined}
						onChange={(val) => {
							changedFields.current.add("rate");
							setRate(val as ExpenseType["rate"]);
						}}
						className="w-full"
						loading={isLoading}
					/>
				</div>
			</div>
		</form>
	);
}

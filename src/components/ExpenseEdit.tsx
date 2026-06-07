"use client";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { PillText } from "@/components/PillText";
import CurrencyInput from "@/components/ui/currency-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ExpenseType,
	type ExpenseWithMonthlyCLPPriceType,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";
import useExpense from "@/utility/data/useExpense";
import useExpenseCreate from "@/utility/data/useExpenseCreate";
import useExpenseEdit from "@/utility/data/useExpenseEdit";
import {
	categoryToOptionClass,
	mapTypeToIcon,
} from "@/utility/expensesIconUtil";
import { getNowInUTC } from "@/utility/timeUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";

export default function ExpenseEdit({
	id,
	formId,
	initialData,
	loading = false,
}: {
	id?: number;
	formId: string;
	initialData?: ExpenseWithMonthlyCLPPriceType;
	loading?: boolean;
}) {
	const editMutation = useExpenseEdit();
	const createMutation = useExpenseCreate();
	const { data: expense } = useExpense(id, initialData);
	const navigate = useNavigate();
	const isLoading = loading || (Boolean(id) && !expense);
	const [type, setType] = useState(expense?.type ?? "Freelance");
	const [category, setCategory] = useState(
		expense?.category ?? "Administrative",
	);
	const [rate, setRate] = useState(expense?.rate ?? "Monthly");
	const [originalPrice, setOriginalPrice] = useState(
		expense?.originalPrice ?? 0,
	);
	const [originalCurrency, setOriginalCurrency] = useState(
		expense?.originalCurrency ?? "USD",
	);

	const form = useForm({
		defaultValues: {
			name: expense?.name ?? "",
		},
		onSubmit: async ({ value }) => {
			navigate({ to: "/expenses" });
			const expenseData = {
				name: value.name,
				type,
				category,
				rate,
				originalPrice,
				originalCurrency,
			};
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
		setType(expense.type ?? "Freelance");
		setCategory(expense.category ?? "Administrative");
		setRate(expense.rate ?? "Monthly");
		setOriginalPrice(expense.originalPrice ?? 0);
		setOriginalCurrency(expense.originalCurrency ?? "USD");
		form.setFieldValue("name", expense.name ?? "");
	}, [expense, form.setFieldValue]);

	const categoryOptions = useComboboxOptions({
		optionValues: expenseCategoryEnum.enumValues,
		renderer: (cat) => (
			<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
		),
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
							!value ? "This field is required" : undefined,
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
									placeholder="Expense name"
									type="text"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
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
						onChange={(val) => setCategory(val as ExpenseType["category"])}
						className="w-full"
						loading={isLoading}
					/>
					<FormInputCombobox
						options={typeOptions}
						label="Type"
						value={type}
						onChange={(val) => setType(val as ExpenseType["type"])}
						className="w-full"
						loading={isLoading}
					/>
					<CurrencyInput
						label="Original price"
						onCurrencyChange={setOriginalCurrency}
						onValueChange={setOriginalPrice}
						currency={originalCurrency}
						value={originalPrice}
						loading={isLoading}
					/>
					<FormInputCombobox
						options={rateOptions}
						label="Billing Rate"
						value={rate}
						onChange={(val) => setRate(val as ExpenseType["rate"])}
						className="w-full"
						loading={isLoading}
					/>
				</div>
			</div>
		</form>
	);
}

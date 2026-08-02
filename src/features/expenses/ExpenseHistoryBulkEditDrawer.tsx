"use client";

import { useForm } from "@tanstack/react-form";
import { SaveIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Button } from "@/components/ui/button";
import CurrencyInput from "@/components/ui/currency-input";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import type { ExpenseType } from "@/db/schema";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import { commonValue, hasCommonValue, pickChanged } from "@/utility/bulkEdit";
import { useExpenseHistoryTransactionBatchEdit } from "@/utility/data/useExpenseHistoryTransactionMutations";
import useExpenses from "@/utility/data/useExpenses";
import type {
	ExpenseHistoryTransaction,
	ExpenseHistoryTransactionMutation,
} from "@/utility/expenseHistoryContracts";
import { mapTypeToIcon } from "@/utility/expensesIconUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";

const formId = "bulk-edit-expense-history-form";
type EditableTransaction = Omit<
	ExpenseHistoryTransactionMutation,
	"lastModified"
>;
type EditableField = keyof EditableTransaction;

export default function ExpenseHistoryBulkEditDrawer({
	rows,
	open,
	onClose,
}: {
	rows: ExpenseHistoryTransaction[];
	open: boolean;
	onClose: () => void;
}) {
	const editMutation = useExpenseHistoryTransactionBatchEdit();
	const { data: expenses = [], isPending: expensesPending } = useExpenses();
	const changedFields = useRef(new Set<EditableField>());
	const expenseIds = useMemo(
		() => rows.map((row) => ({ value: row.expense?.id ?? null })),
		[rows],
	);
	const initialExpenseId = commonValue(expenseIds, "value");
	const initialAmount = commonValue(rows, "amount");
	const [amount, setAmount] = useState<number | undefined>(initialAmount);
	const [category, setCategory] = useState(commonValue(rows, "category") ?? "");
	const [type, setType] = useState(commonValue(rows, "type") ?? "");
	const [expenseId, setExpenseId] = useState(
		initialExpenseId === undefined || initialExpenseId === null
			? ""
			: String(initialExpenseId),
	);
	const form = useForm({
		defaultValues: {
			description: commonValue(rows, "description") ?? "",
		},
		onSubmit: async ({ value }) => {
			const editable = {
				description: value.description.trim(),
				amount: amount ?? 0,
				category: (category || null) as ExpenseType["category"] | null,
				type: (type || null) as ExpenseType["type"] | null,
				expenseId: expenseId ? Number(expenseId) : null,
			};
			const changes = pickChanged(editable, changedFields.current);
			if (Object.keys(changes).length === 0) {
				onClose();
				return;
			}
			const items = rows.map((transaction) => {
				const selectedExpense =
					changes.expenseId === undefined
						? undefined
						: expenses.find((expense) => expense.id === changes.expenseId);
				const { expenseId: _expenseId, ...optimisticFields } = changes;
				return {
					transaction,
					change: changes,
					optimisticChange: {
						...optimisticFields,
						...(changes.expenseId !== undefined
							? {
									expense: selectedExpense
										? { id: selectedExpense.id, name: selectedExpense.name }
										: null,
									...(selectedExpense
										? {
												category: selectedExpense.category,
												type: selectedExpense.type,
											}
										: {}),
								}
							: {}),
					},
				};
			});
			await editMutation.mutateAsync(items);
			onClose();
		},
	});

	useEffect(() => {
		changedFields.current.clear();
		setAmount(initialAmount);
		setCategory(commonValue(rows, "category") ?? "");
		setType(commonValue(rows, "type") ?? "");
		setExpenseId(
			initialExpenseId === undefined || initialExpenseId === null
				? ""
				: String(initialExpenseId),
		);
		form.setFieldValue("description", commonValue(rows, "description") ?? "");
	}, [form.setFieldValue, initialAmount, initialExpenseId, rows]);

	const categoryOptions = useComboboxOptions({
		optionValues: ["", ...expenseCategoryEnum.enumValues],
		renderer: (value) =>
			value ? (
				<ExpenseCategoryBadge value={value as ExpenseType["category"]} />
			) : (
				<span className="italic text-muted-foreground">Unclassified</span>
			),
	});
	const typeOptions = useComboboxOptions({
		optionValues: ["", ...expenseTypeEnum.enumValues],
		renderer: (value) =>
			value ? (
				<>
					{mapTypeToIcon(value as ExpenseType["type"], 24)}
					<span>{value}</span>
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
	const mixed = (field: keyof ExpenseHistoryTransaction) =>
		rows.length > 0 && !hasCommonValue(rows, field);
	const associationMixed =
		expenseIds.length > 0 && !hasCommonValue(expenseIds, "value");
	const pending = editMutation.isPending;

	return (
		<ResponsiveModal
			open={open}
			title={`Edit ${rows.length} transactions`}
			description="Only fields you change will be applied to every selected transaction."
			onClose={onClose}
			footer={
				<>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" form={formId} disabled={pending}>
						<SaveIcon />
						Apply to {rows.length}
					</Button>
				</>
			}
		>
			<form
				id={formId}
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-6"
			>
				<form.Field
					name="description"
					validators={{
						onSubmit: ({ value }) =>
							changedFields.current.has("description") && !value.trim()
								? "Description is required."
								: undefined,
					}}
				>
					{(field) => (
						<FormInputWrapper
							label="Description"
							error={field.state.meta.errors[0]?.toString()}
						>
							<input
								name={field.name}
								className="form-input dark:bg-card"
								value={field.state.value}
								placeholder={
									mixed("description") ? "Multiple values" : undefined
								}
								onBlur={field.handleBlur}
								onChange={(event) => {
									changedFields.current.add("description");
									field.handleChange(event.target.value);
								}}
								disabled={pending}
							/>
						</FormInputWrapper>
					)}
				</form.Field>

				<CurrencyInput
					label="Effective amount"
					currency="CHF"
					currencyReadOnly
					value={amount}
					onCurrencyChange={() => undefined}
					onValueChange={(value) => {
						changedFields.current.add("amount");
						setAmount(value);
					}}
					onValueClear={() => {
						changedFields.current.delete("amount");
						setAmount(initialAmount);
					}}
					inputProps={{
						disabled: pending,
						required: false,
						placeholder: mixed("amount") ? "Multiple values" : "0.00",
					}}
				/>

				<div className="grid gap-6 sm:grid-cols-2">
					<FormInputCombobox
						label="Category"
						options={categoryOptions}
						value={category}
						placeholder={mixed("category") ? "Multiple values" : undefined}
						onChange={(value) => {
							changedFields.current.add("category");
							setCategory(String(value));
						}}
						className="w-full"
						disabled={pending}
					/>
					<FormInputCombobox
						label="Type"
						options={typeOptions}
						value={type}
						placeholder={mixed("type") ? "Multiple values" : undefined}
						onChange={(value) => {
							changedFields.current.add("type");
							setType(String(value));
						}}
						className="w-full"
						disabled={pending}
					/>
				</div>

				<FormInputCombobox
					label="Recurring expense association"
					options={expenseOptions}
					value={expenseId}
					placeholder={associationMixed ? "Multiple values" : undefined}
					onChange={(value) => {
						changedFields.current.add("expenseId");
						setExpenseId(String(value));
					}}
					className="w-full"
					loading={expensesPending}
					disabled={pending}
				/>
			</form>
		</ResponsiveModal>
	);
}

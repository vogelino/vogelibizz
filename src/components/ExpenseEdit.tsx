"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { ExpenseCategoryLabel } from "@/components/ExpenseCategoryBadge";
import ExpenseMatchSuggestions from "@/components/ExpenseMatchSuggestions";
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
import { commonValue, hasCommonValue, pickChanged } from "@/utility/bulkEdit";
import { expenseQueryOptions, expensesQueryOptions } from "@/utility/data/queryOptions";
import useExpense from "@/utility/data/useExpense";
import useExpenseCreate from "@/utility/data/useExpenseCreate";
import useExpenseEdit from "@/utility/data/useExpenseEdit";
import useResourceBatchMutations from "@/utility/data/useResourceBatchMutations";
import { apiFetch } from "@/utility/dataHookUtil";
import {
  createExpenseWithMatchesSchema,
  editExpenseWithMatchesSchema,
  expenseMatchSuggestionsSchema,
} from "@/utility/expenseMatchSuggestions";
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
    new Set<"name" | "type" | "category" | "rate" | "originalPrice" | "originalCurrency">(),
  );
  const initializedCreateExpenseId = useRef<number | null>(null);
  const editMutation = useExpenseEdit();
  const batchMutation = useResourceBatchMutations("expenses").edit;
  const createMutation = useExpenseCreate();
  const queryClient = useQueryClient();
  const expenseQuery = useExpense(id, id ? initialData : undefined);
  const bulkExpense = useMemo(() => {
    if (!bulkItems?.length) return undefined;
    return {
      ...bulkItems[0],
      name: commonValue(bulkItems, "name") ?? "",
      type: commonValue(bulkItems, "type") ?? ("" as ExpenseType["type"]),
      category: commonValue(bulkItems, "category") ?? ("" as ExpenseType["category"]),
      rate: commonValue(bulkItems, "rate") ?? ("" as ExpenseType["rate"]),
      originalPrice: commonValue(bulkItems, "originalPrice"),
      originalCurrency:
        commonValue(bulkItems, "originalCurrency") ?? ("" as ExpenseType["originalCurrency"]),
    };
  }, [bulkItems]);
  const expense = isBulk ? bulkExpense : id ? expenseQuery.data : initialData;
  const mixed = (key: keyof ExpenseType) =>
    Boolean(isBulk && bulkItems && !hasCommonValue(bulkItems, key));
  const navigate = useNavigate();
  const isLoading = loading || (Boolean(id) && !expense);
  const [type, setType] = useState(expense?.type ?? "Freelance");
  const [category, setCategory] = useState(expense?.category ?? "Administrative");
  const [rate, setRate] = useState(expense?.rate ?? "Monthly");
  const [originalPrice, setOriginalPrice] = useState(
    expense?.originalPrice ?? (isBulk ? undefined : 0),
  );
  const [originalCurrency, setOriginalCurrency] = useState(expense?.originalCurrency ?? "USD");
  const [name, setName] = useState(expense?.name ?? "");
  const [debouncedName, setDebouncedName] = useState(name.trim());
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<number>>(() => new Set());
  const matchRequest = {
    name: debouncedName,
    originalPrice: originalPrice ?? 0,
    originalCurrency,
    rate,
  };
  const matchesQuery = useQuery({
    queryKey: ["expenseMatchSuggestions", matchRequest],
    enabled:
      !isBulk && debouncedName.length >= 6 && (originalPrice ?? 0) > 0 && rate !== "One-time",
    queryFn: async () => {
      const response = await apiFetch("/api/expenses/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchRequest),
      });
      if (!response.ok) throw new Error("Matches could not be loaded.");
      return expenseMatchSuggestionsSchema.parse(await response.json());
    },
  });
  const createWithMatches = useMutation({
    mutationFn: async (input: z.infer<typeof createExpenseWithMatchesSchema>) => {
      const parsed = createExpenseWithMatchesSchema.parse(input);
      const response = await apiFetch("/api/expenses/with-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Expense could not be created.");
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: expensesQueryOptions().queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: ["expenseHistory"] }),
        queryClient.invalidateQueries({
          queryKey: ["expenseMatchSuggestions"],
        }),
      ]);
      toast.success("Expense created and selected transactions linked.");
    },
  });
  const editWithMatches = useMutation({
    mutationFn: async (input: z.infer<typeof editExpenseWithMatchesSchema>) => {
      const response = await apiFetch("/api/expenses/edit-with-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editExpenseWithMatchesSchema.parse(input)),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Expense could not be saved.");
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: expensesQueryOptions().queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: ["expenseHistory"] }),
        queryClient.invalidateQueries({
          queryKey: ["expenseMatchSuggestions"],
        }),
        ...(id
          ? [
              queryClient.invalidateQueries({
                queryKey: expenseQueryOptions(id).queryKey,
              }),
            ]
          : []),
      ]);
      toast.success("Expense saved and selected transactions linked.");
    },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedName(name.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [name]);

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
        const items = bulkItems.map((item) => {
          const {
            clpMonthlyPrice: _clpMonthlyPrice,
            created_at: _createdAt,
            last_modified: _lastModified,
            ...editableItem
          } = item;
          return {
            ...editableItem,
            ...changes,
            id: item.id,
          };
        });
        await batchMutation.mutateAsync(items);
        onBulkComplete?.();
        return;
      }
      const matches = (name.trim() === debouncedName ? (matchesQuery.data ?? []) : [])
        .filter(({ id }) => selectedMatchIds.has(id))
        .map(({ id, lastModified }) => ({ id, lastModified }));
      if (id) {
        try {
          if (matches.length > 0 && expense) {
            await editWithMatches.mutateAsync({
              ...expenseData,
              id,
              lastModified: expense.last_modified,
              matches,
            });
          } else {
            await editMutation.mutateAsync({
              ...expenseData,
              id,
              last_modified: getNowInUTC(),
            });
          }
          navigate({
            to: "/expenses",
            search: (previous) => ({ ...previous, duplicateId: undefined }),
          });
        } catch {
          // Keep the form open so the user can review the error and retry.
        }
      } else {
        try {
          if (matches.length > 0) {
            await createWithMatches.mutateAsync({
              ...expenseData,
              matches,
            });
          } else {
            await createMutation.mutateAsync([expenseData]);
          }
          navigate({
            to: "/expenses",
            search: (previous) => ({ ...previous, duplicateId: undefined }),
          });
        } catch {
          // Keep the form open so the user can review the error and retry.
        }
      }
    },
  });

  useEffect(() => {
    if (!expense) return;
    if (!id && !isBulk) {
      if (initializedCreateExpenseId.current === expense.id) return;
      initializedCreateExpenseId.current = expense.id;
    }
    changedFields.current.clear();
    setType(expense.type ?? "Freelance");
    setCategory(expense.category ?? "Administrative");
    setRate(expense.rate ?? "Monthly");
    setOriginalPrice(expense.originalPrice ?? (isBulk ? undefined : 0));
    setOriginalCurrency(expense.originalCurrency ?? "USD");
    setName(expense.name ?? "");
    setSelectedMatchIds(new Set());
    form.setFieldValue("name", expense.name ?? "");
  }, [expense, form.setFieldValue, id, isBulk]);

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
                  placeholder={mixed("name") ? "Multiple values" : "Expense name"}
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    changedFields.current.add("name");
                    field.handleChange(e.target.value);
                    setName(e.target.value);
                    setSelectedMatchIds(new Set());
                  }}
                  // Intentionally focus the field when the modal opens.
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
              setSelectedMatchIds(new Set());
            }}
            onValueChange={(value) => {
              changedFields.current.add("originalPrice");
              setOriginalPrice(value);
              setSelectedMatchIds(new Set());
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
            currencyPlaceholder={mixed("originalCurrency") ? "Multiple values" : undefined}
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
              setSelectedMatchIds(new Set());
            }}
            className="w-full"
            loading={isLoading}
          />
        </div>
        {!isBulk && rate !== "One-time" ? (
          <ExpenseMatchSuggestions
            matches={name.trim() === debouncedName ? (matchesQuery.data ?? []) : []}
            selectedIds={selectedMatchIds}
            setSelectedIds={setSelectedMatchIds}
            isFetching={matchesQuery.isFetching || name.trim() !== debouncedName}
            hasError={Boolean(matchesQuery.error)}
            description="Matches follow the current name and amount. Choose bank transactions to link when you save."
            emptyMessage={
              !name.trim() || !originalPrice
                ? "Enter a name and amount to find matching transactions."
                : undefined
            }
            idPrefix="expense-match"
          />
        ) : null}
        {createWithMatches.error ? (
          <p role="alert" className="text-sm text-destructive">
            {createWithMatches.error.message}
          </p>
        ) : null}
        {editWithMatches.error ? (
          <p role="alert" className="text-sm text-destructive">
            {editWithMatches.error.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

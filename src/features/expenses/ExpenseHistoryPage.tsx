"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { FileUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CurrencySettingSelect } from "@/components/CurrencySettingSelect";
import { DataTable } from "@/components/DataTable";
import { useResourceActions } from "@/components/ResourcePageLayout";
import { Button } from "@/components/ui/button";
import type { CurrencyIdType } from "@/db/schema";
import {
	amountSearchText,
	filterRowsByText,
} from "@/features/search/searchEngine";
import { Route } from "@/routes/_resource/expenses/history";
import {
	exchangeRatesQueryOptions,
	expenseDashboardQueryOptions,
	expenseHistoryMonthQueriesKey,
	expenseHistoryMonthsQueryOptions,
	expenseOverviewSummaryQueryOptions,
} from "@/utility/data/queryOptions";
import useExpenseHistoryMonth from "@/utility/data/useExpenseHistoryMonth";
import useExpenseHistoryMonths from "@/utility/data/useExpenseHistoryMonths";
import useExpenseHistoryTransactionDelete from "@/utility/data/useExpenseHistoryTransactionDelete";
import { useExpenseHistoryTransactionInlineEdit } from "@/utility/data/useExpenseHistoryTransactionMutations";
import useExpenses from "@/utility/data/useExpenses";
import { apiFetch } from "@/utility/dataHookUtil";
import {
	getValueInTargetCurrencyPerMonth,
	type RatesMapType,
} from "@/utility/expenseFetchUtil";
import {
	calculateExpenseHistoryClassificationTotals,
	calculateExpenseHistoryMonthlySummary,
} from "@/utility/expenseHistoryCalculations";
import type {
	ExpenseHistoryTransaction,
	ExpenseHistoryTransactionMutation,
} from "@/utility/expenseHistoryContracts";
import {
	type ExpenseHistoryImportCommitResult,
	type ExpenseHistoryImportPreview,
	expenseHistoryImportCommitResultSchema,
	expenseHistoryImportPreviewSchema,
} from "@/utility/expenseHistoryImportContracts";
import { useUrlSearchState } from "@/utility/useUrlSearchState";
import { ExpenseFilter } from "./ExpenseFilter";
import {
	ExpenseHistoryImportDialog,
	ExpenseHistoryMonthNavigation,
	ExpenseHistoryOverviewPanel,
	formatExpenseHistoryMonth,
} from "./ExpenseHistoryPresentation";
import { getExpenseHistoryColumns } from "./expenseHistoryColumns";

type ImportSource = {
	workbookBase64: string;
	sourceFilename: string;
};

type ExpenseHistoryFilterState = {
	category: NonNullable<ExpenseHistoryTransaction["category"]>[];
	type: NonNullable<ExpenseHistoryTransaction["type"]> | "All types";
	otherOnly: boolean;
	uncategorizedOnly: boolean;
};

const expenseHistoryFilterDefaults: ExpenseHistoryFilterState = {
	category: [],
	type: "All types",
	otherOnly: false,
	uncategorizedOnly: false,
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
	const bytes = new Uint8Array(buffer);
	const chunkSize = 32_768;
	let binary = "";
	for (let offset = 0; offset < bytes.length; offset += chunkSize) {
		binary += String.fromCharCode(
			...bytes.subarray(offset, offset + chunkSize),
		);
	}
	return btoa(binary);
}

async function postImport<Output>(
	path: "preview" | "commit",
	body: ImportSource & { replaceExistingMonths?: boolean },
): Promise<Output> {
	const response = await apiFetch(`/api/expense-history/import/${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	let result: unknown;
	try {
		result = await response.json();
	} catch {
		throw new Error(
			`Import ${path} failed with HTTP ${response.status}, but the server did not return an error message. Check the server log.`,
		);
	}
	if (!response.ok) {
		const errorResult = result as { error?: unknown; errorId?: unknown };
		const message =
			typeof errorResult.error === "string"
				? errorResult.error
				: `Import ${path} failed with HTTP ${response.status}.`;
		const reference =
			typeof errorResult.errorId === "string"
				? ` Error reference: ${errorResult.errorId}`
				: "";
		throw new Error(`${message}${reference}`);
	}
	return result as Output;
}

export default function ExpenseHistoryPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const updateSearch = useCallback(
		(nextSearch: typeof search) =>
			navigate({ search: nextSearch, replace: true }),
		[navigate],
	);
	const [filters, setFilters] = useUrlSearchState(
		search,
		expenseHistoryFilterDefaults,
		updateSearch,
	);
	const queryClient = useQueryClient();
	const monthsQuery = useExpenseHistoryMonths();
	const months = monthsQuery.data ?? [];
	const selectedMonth = search.month ?? null;
	const monthIndex = months.findIndex(({ month }) => month === selectedMonth);
	const selectedMonthIsValid = selectedMonth === null || monthIndex >= 0;
	const monthQuery = useExpenseHistoryMonth(
		monthsQuery.isPending ||
			monthsQuery.error ||
			months.length === 0 ||
			!selectedMonthIsValid
			? undefined
			: selectedMonth,
	);
	const monthDetail = monthQuery.data?.pages[0];
	const targetCurrency = monthDetail?.currency ?? "CLP";
	const { data: recurringExpenses = [] } = useExpenses();
	const exchangeRatesQuery = useQuery(exchangeRatesQueryOptions());
	const { mutate: editInlineTransaction } =
		useExpenseHistoryTransactionInlineEdit();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [source, setSource] = useState<ImportSource | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<ExpenseHistoryImportPreview | null>(
		null,
	);
	const [fileError, setFileError] = useState<string | null>(null);
	const [importOpen, setImportOpen] = useState(false);
	const [selectedRows, setSelectedRows] = useState<ExpenseHistoryTransaction[]>(
		[],
	);
	const tableRef = useRef<TanstackTable<ExpenseHistoryTransaction> | null>(
		null,
	);
	const { isPending: deletePending, mutate: deleteTransactions } =
		useExpenseHistoryTransactionDelete();

	const previewMutation = useMutation({
		mutationFn: async (input: ImportSource) =>
			expenseHistoryImportPreviewSchema.parse(
				await postImport<ExpenseHistoryImportPreview>("preview", input),
			),
		onSuccess: setPreview,
	});

	const commitMutation = useMutation({
		mutationFn: async (replaceExistingMonths: boolean) => {
			if (!source) throw new Error("Choose a bank export file first.");
			return expenseHistoryImportCommitResultSchema.parse(
				await postImport<ExpenseHistoryImportCommitResult>("commit", {
					...source,
					replaceExistingMonths,
				}),
			);
		},
		onSuccess: async (result) => {
			setImportOpen(false);
			setPreview(null);
			setSource(null);
			setSelectedFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			const selectedImportedMonth = result.months.at(-1);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: expenseHistoryMonthsQueryOptions().queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseHistoryMonthQueriesKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseOverviewSummaryQueryOptions().queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseDashboardQueryOptions().queryKey,
				}),
			]);
			if (selectedImportedMonth) {
				await navigate({
					search: (previous) => ({
						...previous,
						month: selectedImportedMonth,
					}),
					replace: true,
				});
			}
		},
	});

	const commitError =
		commitMutation.error instanceof Error ? commitMutation.error.message : null;
	const previewError =
		previewMutation.error instanceof Error
			? previewMutation.error.message
			: null;
	const importError = fileError ?? commitError ?? previewError;

	async function selectFile(file: File | null) {
		setPreview(null);
		setFileError(null);
		previewMutation.reset();
		commitMutation.reset();
		setSelectedFile(file);
		if (!file) {
			setSource(null);
			return;
		}
		try {
			const nextSource: ImportSource = {
				workbookBase64: arrayBufferToBase64(await file.arrayBuffer()),
				sourceFilename: file.name,
			};
			setSource(nextSource);
			previewMutation.mutate(nextSource);
		} catch {
			setSource(null);
			setFileError("The selected file could not be read.");
		}
	}

	const chooseMonth = (month: string | null) =>
		navigate({
			search: (previous) => ({ ...previous, month: month ?? undefined }),
			replace: true,
		});
	const editTransaction = useCallback(
		(
			transaction: ExpenseHistoryTransaction,
			change: Omit<ExpenseHistoryTransactionMutation, "lastModified">,
			optimisticChange?: Partial<ExpenseHistoryTransaction>,
		) => {
			editInlineTransaction({ transaction, change, optimisticChange });
		},
		[editInlineTransaction],
	);
	const convertTargetAmountToChf = useMemo(() => {
		if (targetCurrency === "CHF") return (amount: number) => amount;
		if (!exchangeRatesQuery.data) return undefined;
		const rates = new Map(
			Object.entries(exchangeRatesQuery.data) as [CurrencyIdType, number][],
		) as RatesMapType;
		return (amount: number) =>
			getValueInTargetCurrencyPerMonth({
				value: amount,
				currency: targetCurrency,
				targetCurrency: "CHF",
				billingRate: "Monthly",
				rates,
			}) ?? amount;
	}, [exchangeRatesQuery.data, targetCurrency]);
	const columns = useMemo(
		() =>
			getExpenseHistoryColumns(
				targetCurrency,
				editTransaction,
				recurringExpenses,
				convertTargetAmountToChf,
			),
		[
			convertTargetAmountToChf,
			editTransaction,
			recurringExpenses,
			targetCurrency,
		],
	);
	const historyLoading =
		monthsQuery.isPending ||
		(months.length > 0 && selectedMonthIsValid && monthQuery.isPending);
	const historyError = monthsQuery.error ?? monthQuery.error;
	const transactions = useMemo(
		() =>
			!historyError && monthQuery.data
				? monthQuery.data.pages.flatMap((page) => page.transactions)
				: [],
		[historyError, monthQuery.data],
	);
	const visibleTransactions = useMemo(() => {
		const matchingText = filterRowsByText(
			transactions,
			search.q,
			(transaction) => transaction.id,
			(transaction) =>
				[
					transaction.id,
					transaction.description,
					transaction.originalDescription,
					transaction.bookedAt,
					transaction.category,
					transaction.type,
					transaction.expense?.name,
					amountSearchText(transaction.amount),
					amountSearchText(transaction.originalAmount, "CHF"),
				]
					.filter(Boolean)
					.join(" "),
		);
		const matchingCategory = filters.uncategorizedOnly
			? matchingText.filter((transaction) => transaction.category === null)
			: matchingText;
		return matchingCategory.filter((transaction) => {
			const transactionMonth = transaction.bookedAt.slice(0, 7);
			return (
				(filters.category.length === 0 ||
					(transaction.category !== null &&
						filters.category.includes(transaction.category))) &&
				(filters.type === "All types" || transaction.type === filters.type) &&
				(!filters.otherOnly || transaction.expense === null) &&
				(!search.fromMonth || transactionMonth >= search.fromMonth) &&
				(!search.toMonth || transactionMonth <= search.toMonth)
			);
		});
	}, [
		filters.category,
		filters.otherOnly,
		filters.type,
		filters.uncategorizedOnly,
		search.fromMonth,
		search.q,
		search.toMonth,
		transactions,
	]);
	const hasActiveHistoryFilters =
		filters.category.length > 0 ||
		filters.type !== "All types" ||
		filters.otherOnly ||
		filters.uncategorizedOnly ||
		Boolean(search.q || search.fromMonth || search.toMonth);
	const filteredSummary = useMemo(
		() => calculateExpenseHistoryMonthlySummary(visibleTransactions),
		[visibleTransactions],
	);
	const historyChartSeries = useMemo(
		() => ({
			categories: calculateExpenseHistoryClassificationTotals(
				visibleTransactions,
				(transaction) => transaction.category,
			),
			types: calculateExpenseHistoryClassificationTotals(
				visibleTransactions,
				(transaction) => transaction.type,
			),
		}),
		[visibleTransactions],
	);
	const filteredSummaryLoading =
		hasActiveHistoryFilters &&
		(monthQuery.hasNextPage || monthQuery.isFetchingNextPage);
	useEffect(() => {
		if (!monthQuery.hasNextPage || monthQuery.isFetchingNextPage) {
			return;
		}
		void monthQuery.fetchNextPage();
	}, [
		monthQuery.fetchNextPage,
		monthQuery.hasNextPage,
		monthQuery.isFetchingNextPage,
	]);
	const loadMoreTransactions = useCallback(() => {
		if (monthQuery.hasNextPage && !monthQuery.isFetchingNextPage) {
			void monthQuery.fetchNextPage();
		}
	}, [monthQuery]);
	const resourceActions = useMemo(() => {
		return (
			<>
				{selectedRows.length > 0 ? (
					<Button
						type="button"
						variant="destructive"
						size="sm"
						disabled={deletePending}
						onClick={() => {
							deleteTransactions(
								selectedRows.map(({ id }) => id),
								{
									onSuccess: () => {
										setSelectedRows([]);
										tableRef.current?.resetRowSelection();
									},
								},
							);
						}}
					>
						Delete selected ({selectedRows.length})
					</Button>
				) : null}
				<Button type="button" onClick={() => setImportOpen(true)}>
					<FileUp size={16} />
					Import transactions
				</Button>
			</>
		);
	}, [deletePending, deleteTransactions, selectedRows]);
	useResourceActions(resourceActions);

	return (
		<>
			<ExpenseHistoryImportDialog
				open={importOpen}
				onOpenChange={setImportOpen}
				fileInputRef={fileInputRef}
				selectedFile={selectedFile}
				onSelectFile={selectFile}
				preview={preview}
				error={importError}
				errorStage={commitError ? "commit" : "preview"}
				previewPending={previewMutation.isPending}
				commitPending={commitMutation.isPending}
				onImport={(replaceExistingMonths) =>
					commitMutation.mutate(replaceExistingMonths)
				}
			/>

			<section aria-labelledby="history-heading" className="contents">
				<h2 id="history-heading" className="sr-only">
					Expense history
				</h2>

				{!monthsQuery.isPending && !monthsQuery.error && months.length === 0 ? (
					<div className="py-12 text-center px-6 md:px-10 sticky left-0">
						<h3 className="font-semibold">No imported expense history</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Import a bank export to add your first expense history.
						</p>
					</div>
				) : !monthsQuery.isPending &&
					!monthsQuery.error &&
					selectedMonth !== null &&
					monthIndex < 0 ? (
					<output
						className="block py-12 text-center px-6 md:px-10 sticky left-0"
						aria-label="This month is not available"
					>
						<h3 className="font-semibold">This month is not available</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Choose one of the imported months to continue.
						</p>
					</output>
				) : (
					<>
						{historyLoading || filteredSummaryLoading ? (
							<ExpenseHistoryOverviewPanel loading />
						) : monthDetail ? (
							<ExpenseHistoryOverviewPanel
								loading={false}
								summary={
									hasActiveHistoryFilters
										? filteredSummary
										: monthDetail.summary
								}
								currency={monthDetail.currency}
								categorySeries={historyChartSeries.categories}
								typeSeries={historyChartSeries.types}
								chartsLoading={
									monthQuery.hasNextPage || monthQuery.isFetchingNextPage
								}
							/>
						) : null}
						<DataTable
							key={`${selectedMonth ?? "all-expense-history"}-${filters.uncategorizedOnly ? "uncategorized" : "all"}-${search.fromMonth ?? "start"}-${search.toMonth ?? "end"}`}
							columns={columns}
							data={visibleTransactions}
							loading={historyLoading}
							virtualized
							hasMore={monthQuery.hasNextPage}
							loadingMore={monthQuery.isFetchingNextPage}
							onEndReached={loadMoreTransactions}
							getRowId={(transaction) => String(transaction.id)}
							enableRowSelection
							onSelectionChange={setSelectedRows}
							initialState={{
								columnFilters: [
									...(filters.category.length
										? [{ id: "category", value: filters.category }]
										: []),
									...(filters.type !== "All types"
										? [{ id: "type", value: filters.type }]
										: []),
									...(filters.otherOnly
										? [{ id: "association", value: true }]
										: []),
								],
							}}
							classNames={{
								table: "min-w-240",
								header: "top-32",
								toolbar: "pb-0",
							}}
							toolbarSkeleton={
								<div className="flex flex-col gap-3 py-4 px-6 md:px-10 md:flex-row md:items-center md:justify-between sticky left-0">
									<ExpenseFilter loading />
									<ExpenseHistoryMonthNavigation loading />
								</div>
							}
							caption={
								<span className="sr-only">
									Imported bank transactions. Editable values can be changed
									inline. Original bank values remain available in the
									transaction detail.
								</span>
							}
							toolbar={(table) => (
								<>
									{(() => {
										tableRef.current = table;
										return null;
									})()}
									<div className="flex flex-col flex-wrap gap-3 py-4 px-6 md:px-10 md:flex-row md:items-center md:justify-between sticky left-0">
										<ExpenseFilter
											loading={false}
											table={table}
											filters={filters}
											onFiltersChange={(nextFilters) =>
												setFilters({
													category: nextFilters.category.filter(
														(
															category,
														): category is NonNullable<
															ExpenseHistoryTransaction["category"]
														> => category !== "Mixed",
													),
													type:
														nextFilters.type === "Mixed"
															? "All types"
															: nextFilters.type,
													otherOnly: nextFilters.otherOnly,
													uncategorizedOnly: filters.uncategorizedOnly,
												})
											}
										/>
										{filters.uncategorizedOnly ? (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() =>
													setFilters((previous) => ({
														...previous,
														uncategorizedOnly: false,
													}))
												}
											>
												Uncategorized only · Clear
											</Button>
										) : null}
										{search.fromMonth || search.toMonth ? (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() =>
													navigate({
														search: (previous) => ({
															...previous,
															fromMonth: undefined,
															toMonth: undefined,
														}),
														replace: true,
													})
												}
											>
												{search.fromMonth
													? formatExpenseHistoryMonth(search.fromMonth)
													: "First import"}{" "}
												–{" "}
												{search.toMonth
													? formatExpenseHistoryMonth(search.toMonth)
													: "Latest"}{" "}
												· Clear
											</Button>
										) : null}
										<div className="flex items-center gap-3">
											<CurrencySettingSelect />
											<ExpenseHistoryMonthNavigation
												loading={false}
												months={months}
												selectedMonth={selectedMonth}
												onChooseMonth={chooseMonth}
											/>
										</div>
									</div>
								</>
							)}
						/>
					</>
				)}
			</section>
		</>
	);
}

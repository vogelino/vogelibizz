"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { useResourceActions } from "@/components/ResourcePageLayout";
import { Button } from "@/components/ui/button";
import { Route } from "@/routes/_resource/expenses/history";
import {
	expenseHistoryMonthQueryOptions,
	expenseHistoryMonthsQueryOptions,
	expenseOverviewSummaryQueryOptions,
} from "@/utility/data/queryOptions";
import useExpenseHistoryMonth from "@/utility/data/useExpenseHistoryMonth";
import useExpenseHistoryMonths from "@/utility/data/useExpenseHistoryMonths";
import useExpenseHistoryTransactionDelete from "@/utility/data/useExpenseHistoryTransactionDelete";
import { apiFetch } from "@/utility/dataHookUtil";
import type { ExpenseHistoryTransaction } from "@/utility/expenseHistoryContracts";
import {
	type ExpenseHistoryImportCommitResult,
	type ExpenseHistoryImportPreview,
	expenseHistoryImportCommitResultSchema,
	expenseHistoryImportPreviewSchema,
} from "@/utility/expenseHistoryImportContracts";
import { ExpenseFilter } from "./ExpenseFilter";
import {
	ExpenseHistoryImportPanel,
	ExpenseHistoryMonthNavigation,
	ExpenseHistoryOverviewPanel,
	ExpenseHistoryReplacementDialog,
} from "./ExpenseHistoryPresentation";
import { getExpenseHistoryColumns } from "./expenseHistoryColumns";

type ImportSource = {
	workbookBase64: string;
	sourceFilename: string;
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
	const result = (await response.json()) as { error?: string };
	if (!response.ok) {
		throw new Error(result.error || `Import ${path} failed.`);
	}
	return result as Output;
}

export default function ExpenseHistoryPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const queryClient = useQueryClient();
	const monthsQuery = useExpenseHistoryMonths();
	const months = monthsQuery.data ?? [];
	const selectedMonth = search.month ?? months[0]?.month ?? null;
	const monthIndex = months.findIndex(({ month }) => month === selectedMonth);
	const monthQuery = useExpenseHistoryMonth(
		monthIndex >= 0 ? selectedMonth : null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const replacementTriggerRef = useRef<HTMLButtonElement>(null);
	const replacementCancelRef = useRef<HTMLButtonElement>(null);
	const [source, setSource] = useState<ImportSource | null>(null);
	const [preview, setPreview] = useState<ExpenseHistoryImportPreview | null>(
		null,
	);
	const [fileError, setFileError] = useState<string | null>(null);
	const [replaceOpen, setReplaceOpen] = useState(false);
	const [otherOnly, setOtherOnly] = useState(false);
	const [selectedRows, setSelectedRows] = useState<ExpenseHistoryTransaction[]>(
		[],
	);
	const tableRef = useRef<TanstackTable<ExpenseHistoryTransaction> | null>(
		null,
	);
	const deleteMutation = useExpenseHistoryTransactionDelete(
		selectedMonth ?? "",
	);

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
			setReplaceOpen(false);
			setPreview(null);
			setSource(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			const selectedImportedMonth = result.months.at(-1);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: expenseHistoryMonthsQueryOptions().queryKey,
				}),
				...result.months.map((month) =>
					queryClient.invalidateQueries({
						queryKey: expenseHistoryMonthQueryOptions(month).queryKey,
					}),
				),
				queryClient.invalidateQueries({
					queryKey: expenseOverviewSummaryQueryOptions().queryKey,
				}),
			]);
			if (selectedImportedMonth) {
				await navigate({
					search: { month: selectedImportedMonth },
					replace: true,
				});
			}
		},
	});

	const importError =
		fileError ??
		(previewMutation.error instanceof Error
			? previewMutation.error.message
			: commitMutation.error instanceof Error
				? commitMutation.error.message
				: null);

	async function selectFile(event: ChangeEvent<HTMLInputElement>) {
		setPreview(null);
		setFileError(null);
		previewMutation.reset();
		commitMutation.reset();
		const file = event.target.files?.[0];
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

	const navigation = useMemo(
		() => ({
			newer: monthIndex > 0 ? months[monthIndex - 1]?.month : null,
			older:
				monthIndex >= 0 && monthIndex < months.length - 1
					? months[monthIndex + 1]?.month
					: null,
		}),
		[monthIndex, months],
	);

	const chooseMonth = (month: string) =>
		navigate({ search: { month }, replace: true });
	const columns = useMemo(
		() => getExpenseHistoryColumns(selectedMonth ?? ""),
		[selectedMonth],
	);
	const historyLoading =
		monthsQuery.isPending || (monthIndex >= 0 && monthQuery.isPending);
	const historyError = monthsQuery.error ?? monthQuery.error;
	const transactions =
		!historyError && monthQuery.data ? monthQuery.data.transactions : [];
	const selectionActions = useMemo(() => {
		if (selectedRows.length === 0) return null;
		return (
			<Button
				type="button"
				variant="destructive"
				size="sm"
				disabled={deleteMutation.isPending}
				onClick={() => {
					deleteMutation.mutate(
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
		);
	}, [deleteMutation, selectedRows]);
	useResourceActions(selectionActions);

	return (
		<>
			<ExpenseHistoryImportPanel
				fileInputRef={fileInputRef}
				onSelectFile={selectFile}
				preview={preview}
				error={importError}
				previewPending={previewMutation.isPending}
				commitPending={commitMutation.isPending}
				replacementTriggerRef={replacementTriggerRef}
				onImport={() => commitMutation.mutate(false)}
				onReviewReplacement={() => setReplaceOpen(true)}
			/>

			<section aria-labelledby="history-heading" className="contents">
				<h2 id="history-heading" className="sr-only">
					Expense history
				</h2>

				{!monthsQuery.isPending && !monthsQuery.error && months.length === 0 ? (
					<div className="py-12 text-center px-6 lg:px-10 sticky left-0">
						<h3 className="font-semibold">No imported expense history</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Choose a bank export above to preview your first import.
						</p>
					</div>
				) : !monthsQuery.isPending && !monthsQuery.error && monthIndex < 0 ? (
					<output
						className="block py-12 text-center px-6 lg:px-10 sticky left-0"
						aria-label="This month is not available"
					>
						<h3 className="font-semibold">This month is not available</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Choose one of the imported months to continue.
						</p>
					</output>
				) : (
					<>
						{historyLoading ? (
							<ExpenseHistoryOverviewPanel loading />
						) : monthQuery.data ? (
							<ExpenseHistoryOverviewPanel
								loading={false}
								summary={monthQuery.data.summary}
								otherOnly={otherOnly}
								onOtherOnlyChange={(next) => {
									setOtherOnly(next);
									tableRef.current
										?.getColumn("association")
										?.setFilterValue(next || undefined);
								}}
							/>
						) : null}
						<DataTable
							key={selectedMonth ?? "expense-history"}
							columns={columns}
							data={transactions}
							loading={historyLoading}
							getRowId={(transaction) => String(transaction.id)}
							enableRowSelection
							onSelectionChange={setSelectedRows}
							initialState={{
								pagination: { pageIndex: 0, pageSize: 50 },
								columnFilters: otherOnly
									? [{ id: "association", value: true }]
									: [],
							}}
							classNames={{
								table: "min-w-240",
								header: "top-26",
								toolbar: "pb-0",
							}}
							toolbarSkeleton={
								<div className="flex flex-col gap-3 py-4 px-6 lg:px-10 md:flex-row md:items-center md:justify-between sticky left-0">
									<ExpenseFilter loading />
									<ExpenseHistoryMonthNavigation loading />
								</div>
							}
							caption={
								<span className="sr-only">
									Monthly bank transactions. Open a description to edit the
									transaction. Original bank values remain available within each
									description cell.
								</span>
							}
							emptyMessage={
								otherOnly && !historyError
									? "No Other transactions."
									: undefined
							}
							toolbar={(table) => (
								<>
									{(() => {
										tableRef.current = table;
										return null;
									})()}
									<div className="flex flex-col gap-3 py-4 px-6 lg:px-10 md:flex-row md:items-center md:justify-between sticky left-0">
										<ExpenseFilter loading={false} table={table} />
										<ExpenseHistoryMonthNavigation
											loading={false}
											months={months}
											selectedMonth={monthIndex >= 0 ? selectedMonth : null}
											older={navigation.older}
											newer={navigation.newer}
											onChooseMonth={chooseMonth}
										/>
									</div>
								</>
							)}
						/>
					</>
				)}
			</section>

			<ExpenseHistoryReplacementDialog
				open={replaceOpen}
				months={preview?.replacementMonths ?? []}
				pending={commitMutation.isPending}
				error={
					commitMutation.error instanceof Error
						? commitMutation.error.message
						: null
				}
				cancelRef={replacementCancelRef}
				triggerRef={replacementTriggerRef}
				onOpenChange={setReplaceOpen}
				onConfirm={() => commitMutation.mutate(true)}
			/>
		</>
	);
}

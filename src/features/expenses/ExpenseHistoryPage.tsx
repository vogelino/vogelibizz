"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Route } from "@/routes/_resource/expenses/history";
import {
	expenseHistoryMonthQueryOptions,
	expenseHistoryMonthsQueryOptions,
	expenseOverviewSummaryQueryOptions,
} from "@/utility/data/queryOptions";
import useExpenseHistoryMonth from "@/utility/data/useExpenseHistoryMonth";
import useExpenseHistoryMonths from "@/utility/data/useExpenseHistoryMonths";
import { apiFetch } from "@/utility/dataHookUtil";
import {
	type ExpenseHistoryImportCommitResult,
	type ExpenseHistoryImportPreview,
	expenseHistoryImportCommitResultSchema,
	expenseHistoryImportPreviewSchema,
} from "@/utility/expenseHistoryImportContracts";
import {
	ExpenseHistoryImportPanel,
	ExpenseHistoryMonthNavigation,
	ExpenseHistoryReplacementDialog,
	ExpenseHistorySummaryToolbar,
} from "./ExpenseHistoryPresentation";
import { getExpenseHistoryColumns } from "./expenseHistoryColumns";

type ImportSource = { csv: string; sourceFilename: string };

async function postImport<Output>(
	path: "preview" | "commit",
	body: ImportSource & { replaceExistingMonth?: boolean },
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

	const previewMutation = useMutation({
		mutationFn: async (input: ImportSource) =>
			expenseHistoryImportPreviewSchema.parse(
				await postImport<ExpenseHistoryImportPreview>("preview", input),
			),
		onSuccess: setPreview,
	});

	const commitMutation = useMutation({
		mutationFn: async (replaceExistingMonth: boolean) => {
			if (!source) throw new Error("Choose a CSV file first.");
			return expenseHistoryImportCommitResultSchema.parse(
				await postImport<ExpenseHistoryImportCommitResult>("commit", {
					...source,
					replaceExistingMonth,
				}),
			);
		},
		onSuccess: async (result) => {
			setReplaceOpen(false);
			setPreview(null);
			setSource(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: expenseHistoryMonthsQueryOptions().queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseHistoryMonthQueryOptions(result.month).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: expenseOverviewSummaryQueryOptions().queryKey,
				}),
			]);
			await navigate({
				search: { month: result.month },
				replace: true,
			});
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
			const nextSource = { csv: await file.text(), sourceFilename: file.name };
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
		() => (selectedMonth ? getExpenseHistoryColumns(selectedMonth) : []),
		[selectedMonth],
	);

	return (
		<div className="px-6 pb-12 md:px-10">
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

			<section aria-labelledby="history-heading">
				<h2 id="history-heading" className="sr-only">
					Expense history
				</h2>
				<div className="flex flex-col gap-3 border-b border-border py-4 md:flex-row md:items-center md:justify-between">
					<ExpenseHistoryMonthNavigation
						months={months}
						selectedMonth={monthIndex >= 0 ? selectedMonth : null}
						older={navigation.older}
						newer={navigation.newer}
						onChooseMonth={chooseMonth}
					/>
				</div>

				{monthsQuery.isPending ? (
					<output
						className="space-y-3 py-6"
						aria-label="Loading expense history"
					>
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</output>
				) : monthsQuery.error ? (
					<div role="alert" className="py-8 text-sm">
						Expense history could not be loaded. {monthsQuery.error.message}
					</div>
				) : months.length === 0 ? (
					<div className="py-12 text-center">
						<h3 className="font-semibold">No imported expense history</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Choose a monthly CSV above to preview your first import.
						</p>
					</div>
				) : monthIndex < 0 ? (
					<output className="block py-12 text-center">
						<h3 className="font-semibold">This month is not available</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Choose one of the imported months to continue.
						</p>
					</output>
				) : monthQuery.isPending ? (
					<output
						className="space-y-3 py-6"
						aria-label="Loading monthly transactions"
					>
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</output>
				) : monthQuery.error ? (
					<div role="alert" className="py-8 text-sm">
						Transactions for {selectedMonth} could not be loaded.{" "}
						{monthQuery.error.message}
					</div>
				) : monthQuery.data ? (
					<DataTable
						key={monthQuery.data.month.month}
						columns={columns}
						data={monthQuery.data.transactions}
						getRowId={(transaction) => String(transaction.id)}
						initialState={{
							pagination: { pageIndex: 0, pageSize: 50 },
							columnFilters: otherOnly
								? [{ id: "association", value: true }]
								: [],
						}}
						tableClassName="min-w-[960px]"
						containerClassName="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						containerAriaLabel="Monthly transactions; scroll horizontally on small screens"
						caption={
							<span className="sr-only">
								Monthly bank transactions. Open a description to edit the
								transaction. Original bank values remain available within each
								description cell.
							</span>
						}
						emptyMessage={otherOnly ? "No Other transactions." : undefined}
						toolbar={(table) => (
							<ExpenseHistorySummaryToolbar
								summary={monthQuery.data.summary}
								otherOnly={otherOnly}
								onOtherOnlyChange={(next) => {
									setOtherOnly(next);
									table
										.getColumn("association")
										?.setFilterValue(next || undefined);
								}}
							/>
						)}
					/>
				) : null}
			</section>

			<ExpenseHistoryReplacementDialog
				open={replaceOpen}
				month={preview?.month ?? null}
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
		</div>
	);
}

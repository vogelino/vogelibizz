"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, FileUp, TriangleAlert } from "lucide-react";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Route } from "@/routes/_resource/expenses/history";
import {
	expenseHistoryMonthQueryOptions,
	expenseHistoryMonthsQueryOptions,
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
import { formatCurrency, locale } from "@/utility/formatUtil";
import { ExpenseHistoryTransactionRow } from "./ExpenseHistoryTransactionRow";

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

function formatMonth(month: string) {
	const [year, monthNumber] = month.split("-").map(Number);
	return new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
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

	return (
		<div className="px-6 pb-12 md:px-10">
			<section
				aria-labelledby="import-heading"
				className="my-4 border border-border bg-muted/40 p-4"
			>
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h2 id="import-heading" className="font-semibold">
							Import a monthly bank CSV
						</h2>
						<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
							Preview one calendar month before importing. Credit rows are
							skipped; replacing a month removes its existing transaction edits
							and associations.
						</p>
					</div>
					<label className="flex min-w-0 flex-col gap-1 text-sm">
						<span className="font-medium">Bank CSV file</span>
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv,text/csv,text/plain"
							onChange={selectFile}
							className="max-w-full text-sm file:mr-3 file:h-9 file:border file:border-border file:bg-background file:px-3 file:text-foreground hover:file:bg-accent"
						/>
					</label>
				</div>
				{previewMutation.isPending && (
					<output className="mt-4 block">Validating the CSV…</output>
				)}
				{importError && (
					<div
						role="alert"
						className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm"
					>
						<strong>Import could not be prepared.</strong> {importError}
					</div>
				)}
				{preview && (
					<div
						className="mt-4 border border-border bg-background p-4"
						aria-live="polite"
					>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<h3 className="font-semibold">
									Preview: {formatMonth(preview.month)}
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									{preview.debitCount} debit transactions ·{" "}
									{formatCurrency(preview.totalDebitAmount, "CHF")}
								</p>
							</div>
							<Button
								type="button"
								variant={
									preview.replacementRequired ? "destructive" : "default"
								}
								disabled={commitMutation.isPending}
								onClick={() =>
									preview.replacementRequired
										? setReplaceOpen(true)
										: commitMutation.mutate(false)
								}
							>
								<FileUp size={16} />
								{preview.replacementRequired
									? "Review replacement"
									: "Import month"}
							</Button>
						</div>
						{preview.skippedCreditCount > 0 && (
							<output className="mt-3 flex gap-2 border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
								<TriangleAlert
									className="shrink-0 text-amber-600"
									size={18}
									aria-hidden="true"
								/>
								<span>
									{preview.skippedCreditCount} credit{" "}
									{preview.skippedCreditCount === 1 ? "row was" : "rows were"}{" "}
									skipped and will not be imported.
								</span>
							</output>
						)}
						{preview.warnings
							.filter((warning) => !warning.toLowerCase().includes("credit"))
							.map((warning) => (
								<p key={warning} className="mt-2 text-sm text-muted-foreground">
									{warning}
								</p>
							))}
						{preview.replacementRequired && (
							<p className="mt-3 text-sm font-medium">
								History for this month already exists. Replacement requires
								confirmation.
							</p>
						)}
					</div>
				)}
			</section>

			<section aria-labelledby="history-heading">
				<div className="flex flex-col gap-3 border-b border-border py-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 id="history-heading" className="font-semibold">
							Monthly transactions
						</h2>
						<p className="text-sm text-muted-foreground">
							Imported debits ordered by booked date.
						</p>
					</div>
					{months.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<Button
								type="button"
								size="icon"
								variant="outline"
								disabled={!navigation.older}
								onClick={() =>
									navigation.older && chooseMonth(navigation.older)
								}
								aria-label="Previous imported month"
							>
								<ChevronLeft size={18} />
							</Button>
							<label className="sr-only" htmlFor="history-month">
								Imported month
							</label>
							<select
								id="history-month"
								className="form-select h-9 min-w-44"
								value={monthIndex >= 0 ? (selectedMonth ?? "") : ""}
								onChange={(event) => chooseMonth(event.target.value)}
							>
								{monthIndex < 0 && <option value="">Missing month</option>}
								{months.map(({ month }) => (
									<option key={month} value={month}>
										{formatMonth(month)}
									</option>
								))}
							</select>
							<Button
								type="button"
								size="icon"
								variant="outline"
								disabled={!navigation.newer}
								onClick={() =>
									navigation.newer && chooseMonth(navigation.newer)
								}
								aria-label="Next imported month"
							>
								<ChevronRight size={18} />
							</Button>
						</div>
					)}
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
					<div>
						<div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/30 p-3">
							<div
								className="flex flex-wrap gap-x-6 gap-y-1 text-sm"
								aria-live="polite"
							>
								<span>
									Total{" "}
									<strong>
										{formatCurrency(monthQuery.data.summary.total, "CHF")}
									</strong>
								</span>
								<span>
									Matched{" "}
									<strong>
										{formatCurrency(monthQuery.data.summary.matched, "CHF")}
									</strong>
								</span>
								<span>
									Other{" "}
									<strong>
										{formatCurrency(monthQuery.data.summary.other, "CHF")}
									</strong>
								</span>
							</div>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={otherOnly}
									onChange={(event) => setOtherOnly(event.target.checked)}
								/>
								Other only
							</label>
						</div>
						<div className="overflow-x-auto">
							<Table className="min-w-[960px]">
								<TableHeader>
									<TableRow>
										<TableHead className="w-32">Booked</TableHead>
										<TableHead>Description</TableHead>
										<TableHead className="w-36 text-right">Amount</TableHead>
										<TableHead>Association</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Type</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{monthQuery.data.transactions
										.filter((transaction) => !otherOnly || !transaction.expense)
										.map((transaction) => (
											<ExpenseHistoryTransactionRow
												key={transaction.id}
												transaction={transaction}
												month={monthQuery.data.month.month}
											/>
										))}
								</TableBody>
							</Table>
						</div>
					</div>
				) : null}
			</section>

			<AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Replace {preview ? formatMonth(preview.month) : "this month"}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently deletes every existing transaction for the month,
							including transaction edits and recurring-expense associations,
							then imports the previewed CSV as the new active dataset. Imports
							are not merged.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={commitMutation.isPending}>
							Keep existing month
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={commitMutation.isPending}
							onClick={(event) => {
								event.preventDefault();
								commitMutation.mutate(true);
							}}
						>
							{commitMutation.isPending ? "Replacing…" : "Replace month"}
						</AlertDialogAction>
					</AlertDialogFooter>
					{commitMutation.error instanceof Error && (
						<p role="alert" className="text-sm text-destructive">
							{commitMutation.error.message}
						</p>
					)}
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

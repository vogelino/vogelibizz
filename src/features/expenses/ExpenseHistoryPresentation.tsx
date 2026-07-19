import { ChevronLeft, ChevronRight, FileUp, TriangleAlert } from "lucide-react";
import type { ChangeEventHandler, RefObject } from "react";
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
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utility/classNames";
import type { ExpenseHistoryMonthDetail } from "@/utility/expenseHistoryContracts";
import type { ExpenseHistoryImportPreview } from "@/utility/expenseHistoryImportContracts";
import { formatCurrency, locale } from "@/utility/formatUtil";
import {
	ExpensesOverviewPanelLayout,
	ExpensesOverviewValue,
} from "./ExpensesOverviewPanel";

export function formatExpenseHistoryMonth(month: string) {
	const [year, monthNumber] = month.split("-").map(Number);
	return new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

export function ExpenseHistoryImportPanel({
	fileInputRef,
	onSelectFile,
	preview,
	error,
	previewPending,
	commitPending,
	replacementTriggerRef,
	onImport,
	onReviewReplacement,
}: {
	fileInputRef: RefObject<HTMLInputElement | null>;
	onSelectFile: ChangeEventHandler<HTMLInputElement>;
	preview: ExpenseHistoryImportPreview | null;
	error: string | null;
	previewPending: boolean;
	commitPending: boolean;
	replacementTriggerRef: RefObject<HTMLButtonElement | null>;
	onImport: () => void;
	onReviewReplacement: () => void;
}) {
	return (
		<div className="px-10 sticky left-0">
			<section
				aria-labelledby="import-heading"
				className="my-4 border border-border bg-muted/40 p-4"
			>
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h2 id="import-heading" className="font-semibold">
							Import bank transactions
						</h2>
						<p
							id="bank-export-help"
							className="mt-1 max-w-2xl text-sm text-muted-foreground"
						>
							Choose a Finanzassistent Excel workbook. Credit rows are skipped;
							categories are translated to English and preserved. Replacing
							months removes their existing transaction edits and associations.
						</p>
					</div>
					<label className="flex min-w-0 flex-col gap-1 text-sm">
						<span className="font-medium">Bank export file</span>
						<input
							ref={fileInputRef}
							type="file"
							accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							aria-describedby="bank-export-help"
							aria-invalid={Boolean(error)}
							onChange={onSelectFile}
							className="max-w-full text-sm file:mr-3 file:h-9 file:border file:border-border file:bg-background file:px-3 file:text-foreground hover:file:bg-accent"
						/>
					</label>
				</div>
				{previewPending ? (
					<output className="mt-4 block">Validating the bank export…</output>
				) : null}
				{error ? (
					<div
						role="alert"
						className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm"
					>
						<strong>Import could not be prepared.</strong> {error}
					</div>
				) : null}
				{preview ? (
					<div
						className="mt-4 border border-border bg-background p-4"
						aria-live="polite"
					>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<h3 className="font-semibold">
									Preview: {preview.months.length}{" "}
									{preview.months.length === 1 ? "month" : "months"}
								</h3>
								<p className="mt-1 text-sm">
									{preview.months.map(formatExpenseHistoryMonth).join(", ")}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{preview.debitCount} debit transactions ·{" "}
									{formatCurrency(preview.totalDebitAmount, "CHF")}
								</p>
							</div>
							<Button
								ref={
									preview.replacementRequired
										? replacementTriggerRef
										: undefined
								}
								type="button"
								variant={
									preview.replacementRequired ? "destructive" : "default"
								}
								disabled={commitPending}
								onClick={
									preview.replacementRequired ? onReviewReplacement : onImport
								}
							>
								<FileUp size={16} />
								{preview.replacementRequired
									? "Review replacement"
									: preview.months.length === 1
										? "Import month"
										: "Import months"}
							</Button>
						</div>
						{preview.skippedCreditCount > 0 ? (
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
						) : null}
						{preview.warnings
							.filter((warning) => !warning.toLowerCase().includes("credit"))
							.map((warning) => (
								<p key={warning} className="mt-2 text-sm text-muted-foreground">
									{warning}
								</p>
							))}
						{preview.replacementRequired ? (
							<p className="mt-3 text-sm font-medium">
								History already exists for {preview.replacementMonths.length}{" "}
								{preview.replacementMonths.length === 1 ? "month" : "months"} in
								the selected file. Replacement requires confirmation.
							</p>
						) : null}
					</div>
				) : null}
			</section>
		</div>
	);
}

type ExpenseHistoryMonthNavigationProps =
	| { loading: true }
	| {
			loading: false;
			months: readonly { month: string }[];
			selectedMonth: string | null;
			older: string | null;
			newer: string | null;
			onChooseMonth: (month: string) => void;
	  };

export function ExpenseHistoryMonthNavigation(
	props: ExpenseHistoryMonthNavigationProps,
) {
	const parentClassName = cn("flex items-center gap-y-1");
	if (props.loading) {
		return (
			<div className={parentClassName}>
				<Skeleton className="size-9" />
				<Skeleton className="h-9.5 w-48" />
				<Skeleton className="size-9" />
			</div>
		);
	}
	const { months, selectedMonth, older, newer, onChooseMonth } = props;
	if (months.length === 0) return null;
	return (
		<div className={parentClassName}>
			<Button
				type="button"
				size="icon"
				variant="outline"
				disabled={!older}
				onClick={() => older && onChooseMonth(older)}
				aria-label="Previous imported month"
				className="shrink-0 border-r-0"
			>
				<ChevronLeft size={18} />
			</Button>
			<label className="sr-only" htmlFor="history-month">
				Imported month
			</label>
			<Combobox
				id="history-month"
				value={selectedMonth ?? ""}
				onChange={(value) => onChooseMonth(String(value))}
				options={months.map(({ month }) => ({
					value: month,
					label: formatExpenseHistoryMonth(month),
				}))}
				className="w-48"
			/>
			<Button
				type="button"
				size="icon"
				variant="outline"
				disabled={!newer}
				onClick={() => newer && onChooseMonth(newer)}
				aria-label="Next imported month"
				className="shrink-0 border-l-0"
			>
				<ChevronRight size={18} />
			</Button>
		</div>
	);
}

type ExpenseHistoryOverviewPanelProps =
	| { loading: true }
	| {
			loading: false;
			summary: ExpenseHistoryMonthDetail["summary"];
	  };

export function ExpenseHistoryOverviewPanel(
	props: ExpenseHistoryOverviewPanelProps,
) {
	if (props.loading) {
		return (
			<ExpensesOverviewPanelLayout>
				<ExpensesOverviewValue label="Total" value="" loading />
				<ExpensesOverviewValue label="Matched" value="" loading />
				<ExpensesOverviewValue label="Other" value="" loading />
			</ExpensesOverviewPanelLayout>
		);
	}
	const { summary } = props;
	return (
		<ExpensesOverviewPanelLayout>
			<div className="contents" aria-live="polite">
				<ExpensesOverviewValue
					label="Total"
					value={formatCurrency(summary.total, "CHF")}
					loading={false}
				/>
				<ExpensesOverviewValue
					label="Matched"
					value={formatCurrency(summary.matched, "CHF")}
					loading={false}
				/>
				<ExpensesOverviewValue
					label="Other"
					value={formatCurrency(summary.other, "CHF")}
					loading={false}
				/>
			</div>
		</ExpensesOverviewPanelLayout>
	);
}

export function ExpenseHistoryReplacementDialog({
	open,
	months,
	pending,
	error,
	cancelRef,
	triggerRef,
	onOpenChange,
	onConfirm,
}: {
	open: boolean;
	months: string[];
	pending: boolean;
	error: string | null;
	cancelRef: RefObject<HTMLButtonElement | null>;
	triggerRef: RefObject<HTMLButtonElement | null>;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					cancelRef.current?.focus();
				}}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					triggerRef.current?.focus();
				}}
			>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Replace {months.length === 1 ? "this month" : "these months"}?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This permanently deletes every existing transaction for{" "}
						{months.map(formatExpenseHistoryMonth).join(", ")}, including
						transaction edits and recurring-expense associations. It then
						imports all months in the previewed file as the new active datasets.
						Imports are not merged.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel ref={cancelRef} disabled={pending}>
						Keep existing {months.length === 1 ? "month" : "months"}
					</AlertDialogCancel>
					<AlertDialogAction
						disabled={pending}
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						{pending
							? "Replacing…"
							: `Replace ${months.length === 1 ? "month" : "months"}`}
					</AlertDialogAction>
				</AlertDialogFooter>
				{error ? (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				) : null}
			</AlertDialogContent>
		</AlertDialog>
	);
}

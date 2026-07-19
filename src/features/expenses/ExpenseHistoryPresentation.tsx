import { ChevronLeft, ChevronRight, FileUp, TriangleAlert } from "lucide-react";
import type { RefObject } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
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

export function ExpenseHistoryImportDialog({
	open,
	onOpenChange,
	fileInputRef,
	selectedFile,
	onSelectFile,
	preview,
	error,
	previewPending,
	commitPending,
	onImport,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fileInputRef: RefObject<HTMLInputElement | null>;
	selectedFile: File | null;
	onSelectFile: (file: File | null) => void;
	preview: ExpenseHistoryImportPreview | null;
	error: string | null;
	previewPending: boolean;
	commitPending: boolean;
	onImport: (replaceExistingMonths: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100vh-2rem)] max-w-[calc(100%-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Import bank transactions</DialogTitle>
					<DialogDescription id="bank-export-help">
						Choose a Finanzassistent Excel workbook. Incoming payments are
						excluded because expense history tracks outgoing payments.
						Categories are translated to English and preserved. Replacing months
						removes their existing transaction edits and associations.
					</DialogDescription>
				</DialogHeader>
				<div className="overflow-y-auto p-6">
					<FileUpload
						ref={fileInputRef}
						files={selectedFile ? [selectedFile] : []}
						onFilesChange={(files) => onSelectFile(files[0] ?? null)}
						accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						hideDropzoneWhenFilesSelected
						invalid={Boolean(error)}
						disabled={previewPending || commitPending}
						title="Drop your bank export here, or click to browse"
						description="Finanzassistent Excel workbook (.xlsx)"
					/>

					{previewPending ? (
						<output className="mt-4 block" aria-live="polite">
							Validating the bank export…
						</output>
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
						<div className="mt-4" aria-live="polite">
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
							{preview.skippedCreditCount > 0 ? (
								<Accordion
									type="single"
									collapsible
									className="mt-3 border border-amber-500/40 bg-amber-500/5 text-sm"
								>
									<AccordionItem value="skipped-payments" className="border-0">
										<AccordionTrigger className="px-3 py-3">
											<span className="flex items-center gap-2">
												<TriangleAlert
													className="shrink-0 text-amber-600"
													size={18}
													aria-hidden="true"
												/>
												<strong>
													{preview.skippedCreditCount} incoming{" "}
													{preview.skippedCreditCount === 1
														? "payment"
														: "payments"}{" "}
													will not be imported
												</strong>
											</span>
										</AccordionTrigger>
										<AccordionContent className="pb-0">
											<p className="border-t border-amber-500/30 p-3">
												Expense history includes outgoing payments only. The
												following positive amounts were excluded:
											</p>
											<div className="max-h-64 overflow-auto border-t border-amber-500/30 bg-background">
												<table className="w-full min-w-130 text-left">
													<thead className="sticky top-0 bg-muted">
														<tr>
															<th className="px-3 py-2 font-medium">
																Excel row
															</th>
															<th className="px-3 py-2 font-medium">Date</th>
															<th className="px-3 py-2 font-medium">
																Description
															</th>
															<th className="px-3 py-2 text-right font-medium">
																Amount
															</th>
														</tr>
													</thead>
													<tbody>
														{preview.skippedCredits.map((credit) => (
															<tr
																key={`${credit.rowNumber}-${credit.bookedAt}-${credit.amount}`}
																className="border-t border-border"
															>
																<td className="px-3 py-2 tabular-nums">
																	{credit.rowNumber}
																</td>
																<td className="px-3 py-2 whitespace-nowrap">
																	{credit.bookedAt}
																</td>
																<td className="px-3 py-2">
																	{credit.description}
																</td>
																<td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
																	{formatCurrency(credit.amount, "CHF")}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							) : null}
							{preview.warnings.map((warning) => (
								<p key={warning} className="mt-2 text-sm text-muted-foreground">
									{warning}
								</p>
							))}
							{preview.replacementRequired ? (
								<p className="mt-3 text-sm font-medium">
									History already exists for {preview.replacementMonths.length}{" "}
									{preview.replacementMonths.length === 1 ? "month" : "months"}{" "}
									in the selected file. Replacing it removes existing
									transaction edits and recurring-expense associations.
								</p>
							) : null}
						</div>
					) : null}
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline" disabled={commitPending}>
							Cancel
						</Button>
					</DialogClose>
					{preview ? (
						<Button
							type="button"
							variant={preview.replacementRequired ? "destructive" : "default"}
							disabled={commitPending}
							onClick={() => onImport(preview.replacementRequired)}
						>
							<FileUp size={16} />
							{commitPending
								? preview.replacementRequired
									? "Replacing…"
									: "Importing…"
								: preview.replacementRequired
									? `Replace ${preview.replacementMonths.length} ${preview.replacementMonths.length === 1 ? "month" : "months"}`
									: `Import ${preview.months.length} ${preview.months.length === 1 ? "month" : "months"}`}
						</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
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

"use client";

import { PlusIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import {
	currencyEnum,
	type InvoiceLineItemType,
	type InvoiceType,
	invoiceLanguageEnum,
} from "@/db/schema";
import useInvoice from "@/utility/data/useInvoice";
import useInvoiceEdit from "@/utility/data/useInvoiceEdit";
import useSettings from "@/utility/data/useSettings";
import { InvoicePdfPreview } from "./InvoicePdfPreview";
import { buildInvoicePdfData } from "./invoicePdfData";

type InvoiceDraftState = {
	name: string;
	date: string;
	invoiceNumber: number;
	clientNumber: string;
	currency: InvoiceType["currency"];
	language: InvoiceType["language"];
	hourlyRate: number;
	invoiceLocation: string;
	subject: string;
	introduction: string;
	footNote: string;
	rows: InvoiceLineItemType[];
};

const currencyOptions = currencyEnum.enumValues.map((currency) => ({
	label: currency,
	value: currency,
}));

const languageOptions = invoiceLanguageEnum.enumValues.map((language) => ({
	label: language,
	value: language,
}));

export default function InvoiceEditorPage({
	id,
	initialData,
}: {
	id: number;
	initialData?: InvoiceType;
}) {
	const invoiceQuery = useInvoice(id, initialData);
	const settingsQuery = useSettings();
	const editMutation = useInvoiceEdit();
	const invoice = invoiceQuery.data;
	const [draft, setDraft] = useState<InvoiceDraftState | null>(
		initialData ? toDraft(initialData) : null,
	);

	useEffect(() => {
		if (!invoice) return;
		setDraft(toDraft(invoice));
	}, [invoice]);

	const previewInvoice = useMemo(() => {
		if (!invoice || !draft) return null;
		return {
			...invoice,
			...draft,
			rows: draft.rows,
		};
	}, [draft, invoice]);

	const previewData = useMemo(() => {
		if (!previewInvoice || !settingsQuery.data) return null;
		return buildInvoicePdfData(previewInvoice, settingsQuery.data);
	}, [previewInvoice, settingsQuery.data]);

	const isLoading = invoiceQuery.isPending || settingsQuery.isPending || !draft;

	function updateDraft<Key extends keyof InvoiceDraftState>(
		key: Key,
		value: InvoiceDraftState[Key],
	) {
		setDraft((currentDraft) =>
			currentDraft ? { ...currentDraft, [key]: value } : currentDraft,
		);
	}

	function updateRow(
		rowIndex: number,
		key: keyof InvoiceLineItemType,
		value: InvoiceLineItemType[keyof InvoiceLineItemType],
	) {
		setDraft((currentDraft) => {
			if (!currentDraft) return currentDraft;
			const nextRows = currentDraft.rows.map((row, index) =>
				index === rowIndex ? { ...row, [key]: value } : row,
			);
			return { ...currentDraft, rows: nextRows };
		});
	}

	function addRow() {
		setDraft((currentDraft) =>
			currentDraft
				? {
						...currentDraft,
						rows: [...currentDraft.rows, { description: "", hoursCount: 0 }],
					}
				: currentDraft,
		);
	}

	function removeRow(rowIndex: number) {
		setDraft((currentDraft) => {
			if (!currentDraft) return currentDraft;
			if (currentDraft.rows.length <= 1) return currentDraft;
			return {
				...currentDraft,
				rows: currentDraft.rows.filter((_, index) => index !== rowIndex),
			};
		});
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!draft) return;
		editMutation.mutate({
			id,
			...draft,
			rows: draft.rows,
		});
	}

	return (
		<div className="px-6 md:px-10 pb-10">
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
				<div>
					<h1 className="text-xl font-semibold">
						{invoice?.name || `Invoice ${id}`}
					</h1>
					<p className="text-sm text-muted-foreground">
						{invoice?.projects?.[0]?.name || "No project linked"}
						{" · "}
						{invoice?.clients?.[0]?.name || "No client linked"}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => window.location.assign("/invoices")}
					>
						Back to invoices
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => window.open(`/pdf?invoiceId=${id}`, "_blank")}
					>
						Open PDF route
					</Button>
				</div>
			</div>
			<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
				<div className="overflow-hidden rounded-md border border-border bg-background">
					<div className="h-[78vh] min-h-[40rem]">
						{previewData ? (
							<InvoicePdfPreview data={previewData} />
						) : (
							<div className="flex h-full flex-col gap-3 p-4">
								<Skeleton className="h-10 w-40" />
								<Skeleton className="h-full w-full" />
							</div>
						)}
					</div>
				</div>
				<aside className="xl:sticky xl:top-24">
					<form
						onSubmit={handleSubmit}
						className="flex max-h-[78vh] min-h-[40rem] flex-col gap-6 overflow-auto rounded-md border border-border bg-card p-4"
					>
						<div className="flex items-center justify-between gap-2">
							<div>
								<h2 className="font-semibold">Invoice content</h2>
								<p className="text-sm text-muted-foreground">
									Edits update the preview immediately.
								</p>
							</div>
							<Button
								type="submit"
								disabled={isLoading || editMutation.isPending}
							>
								<SaveIcon />
								Save
							</Button>
						</div>

						<FormInputWrapper label="Name" loading={isLoading}>
							<input
								type="text"
								value={draft?.name || ""}
								onChange={(event) => updateDraft("name", event.target.value)}
								className="form-input"
							/>
						</FormInputWrapper>

						<div className="grid gap-4 md:grid-cols-2">
							<FormInputWrapper label="Date" loading={isLoading}>
								<input
									type="date"
									value={draft?.date || ""}
									onChange={(event) => updateDraft("date", event.target.value)}
									className="form-input"
								/>
							</FormInputWrapper>
							<FormInputWrapper label="Invoice #" loading={isLoading}>
								<input
									type="number"
									min={1}
									value={draft?.invoiceNumber ?? 1}
									onChange={(event) =>
										updateDraft(
											"invoiceNumber",
											Number(event.target.value || 0),
										)
									}
									className="form-input"
								/>
							</FormInputWrapper>
							<FormInputWrapper label="Client #" loading={isLoading}>
								<input
									type="text"
									value={draft?.clientNumber || ""}
									onChange={(event) =>
										updateDraft("clientNumber", event.target.value)
									}
									className="form-input"
								/>
							</FormInputWrapper>
							<FormInputWrapper label="Location" loading={isLoading}>
								<input
									type="text"
									value={draft?.invoiceLocation || ""}
									onChange={(event) =>
										updateDraft("invoiceLocation", event.target.value)
									}
									className="form-input"
								/>
							</FormInputWrapper>
							<FormInputWrapper label="Currency" loading={isLoading}>
								<Combobox
									options={currencyOptions}
									value={draft?.currency}
									onChange={(value) => {
										if (isCurrencyValue(value)) updateDraft("currency", value);
									}}
									className="w-full"
								/>
							</FormInputWrapper>
							<FormInputWrapper label="Language" loading={isLoading}>
								<Combobox
									options={languageOptions}
									value={draft?.language}
									onChange={(value) => {
										if (isInvoiceLanguageValue(value)) {
											updateDraft("language", value);
										}
									}}
									className="w-full"
								/>
							</FormInputWrapper>
							<FormInputWrapper label="Hourly rate" loading={isLoading}>
								<input
									type="number"
									min={0}
									step={1}
									value={draft?.hourlyRate ?? 0}
									onChange={(event) =>
										updateDraft("hourlyRate", Number(event.target.value || 0))
									}
									className="form-input"
								/>
							</FormInputWrapper>
						</div>

						<FormInputWrapper label="Subject" loading={isLoading}>
							<input
								type="text"
								value={draft?.subject || ""}
								onChange={(event) => updateDraft("subject", event.target.value)}
								className="form-input"
							/>
						</FormInputWrapper>

						<FormInputWrapper label="Introduction" loading={isLoading}>
							<textarea
								value={draft?.introduction || ""}
								onChange={(event) =>
									updateDraft("introduction", event.target.value)
								}
								className="form-input min-h-32"
							/>
						</FormInputWrapper>

						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between gap-2">
								<span className="text-muted-foreground">Line items</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addRow}
								>
									<PlusIcon />
									Add row
								</Button>
							</div>
							<div className="flex flex-col gap-3">
								{draft?.rows.map((row, index) => (
									<div
										key={`${index}-${row.description}`}
										className="grid gap-3 rounded-md border border-border p-3"
									>
										<FormInputWrapper label={`Description ${index + 1}`}>
											<input
												type="text"
												value={row.description}
												onChange={(event) =>
													updateRow(index, "description", event.target.value)
												}
												className="form-input"
											/>
										</FormInputWrapper>
										<div className="flex items-end gap-3">
											<FormInputWrapper label="Hours" loading={false}>
												<input
													type="number"
													min={0}
													step={1}
													value={row.hoursCount}
													onChange={(event) =>
														updateRow(
															index,
															"hoursCount",
															Number(event.target.value || 0),
														)
													}
													className="form-input"
												/>
											</FormInputWrapper>
											<Button
												type="button"
												variant="outline"
												size="icon"
												disabled={(draft?.rows.length || 0) <= 1}
												onClick={() => removeRow(index)}
											>
												<Trash2Icon />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>

						<FormInputWrapper label="Foot note" loading={isLoading}>
							<textarea
								value={draft?.footNote || ""}
								onChange={(event) =>
									updateDraft("footNote", event.target.value)
								}
								className="form-input min-h-24"
							/>
						</FormInputWrapper>
					</form>
				</aside>
			</div>
		</div>
	);
}

function toDraft(invoice: InvoiceType): InvoiceDraftState {
	return {
		name: invoice.name,
		date: invoice.date,
		invoiceNumber: invoice.invoiceNumber,
		clientNumber: invoice.clientNumber,
		currency: invoice.currency,
		language: invoice.language,
		hourlyRate: invoice.hourlyRate,
		invoiceLocation: invoice.invoiceLocation,
		subject: invoice.subject,
		introduction: invoice.introduction,
		footNote: invoice.footNote,
		rows: invoice.rows.map((row) => ({ ...row })),
	};
}

function isCurrencyValue(
	value: string | number,
): value is InvoiceType["currency"] {
	return currencyEnum.enumValues.some((currency) => currency === value);
}

function isInvoiceLanguageValue(
	value: string | number,
): value is InvoiceType["language"] {
	return invoiceLanguageEnum.enumValues.some((language) => language === value);
}

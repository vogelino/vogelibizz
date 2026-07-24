import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import FormInputWrapper from "@/components/FormInputWrapper";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import {
	type InvoiceInsertType,
	type InvoiceType,
	invoiceInsertSchema,
} from "@/db/schema";
import InvoicesList from "@/features/invoices/InvoicesList";
import createQueryFunction from "@/utility/data/createQueryFunction";
import {
	invoiceQueryOptions,
	invoicesQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/invoices/duplicate/$id/modal")(
	{
		loader: async ({ context, params }) => {
			const id = parseId(params.id);
			const [invoice, invoices] = await Promise.all([
				context.queryClient.ensureQueryData(invoiceQueryOptions(id)),
				context.queryClient.ensureQueryData(invoicesQueryOptions()),
			]);
			return { invoice, invoices };
		},
		component: InvoiceDuplicateModal,
	},
);

const createInvoice = createQueryFunction<number[], InvoiceInsertType[]>({
	resourceName: "invoices",
	action: "create",
	inputZodSchema: invoiceInsertSchema.array(),
});

function InvoiceDuplicateModal() {
	const { invoice, invoices } = Route.useLoaderData();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [name, setName] = useState(`copy ${invoice.name}`);
	const nextInvoiceNumber =
		invoices.reduce(
			(maxValue, current) => Math.max(maxValue, current.invoiceNumber),
			0,
		) + 1;
	const formId = `invoice-duplicate-form-${invoice.id}`;
	const createMutation = useMutation({
		mutationKey: ["invoices", "duplicate", invoice.id],
		mutationFn: createInvoice,
		onSuccess: async (ids) => {
			const createdId = ids[0];
			if (typeof createdId !== "number") {
				throw new Error("Invoice duplication did not return an id.");
			}
			await queryClient.invalidateQueries({
				queryKey: invoicesQueryOptions().queryKey,
			});
			navigate({ to: "/invoices/$id", params: { id: String(createdId) } });
		},
	});

	return (
		<>
			<InvoicesList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Duplicate invoice" />}
				onClose={() => navigate({ to: "/invoices" })}
				footer={
					<>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/invoices" })}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form={formId}
							disabled={createMutation.isPending}
						>
							<CopyIcon />
							Duplicate invoice
						</Button>
					</>
				}
			>
				<form
					id={formId}
					onSubmit={(event) => {
						event.preventDefault();
						createMutation.mutate([
							toDuplicateInvoice(invoice, name, nextInvoiceNumber),
						]);
					}}
					className="flex flex-col gap-6"
				>
					<FormInputWrapper
						label="Name"
						error={
							createMutation.isError
								? "The invoice could not be duplicated."
								: undefined
						}
					>
						<input
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
							className="form-input"
							required
							// biome-ignore lint/a11y/noAutofocus: intentional focus on modal open
							autoFocus
						/>
					</FormInputWrapper>
					<p className="text-sm text-muted-foreground">
						Invoice #{invoice.invoiceNumber} and its{" "}
						{invoice.rows.length === 1
							? "1 line item"
							: `${invoice.rows.length} line items`}{" "}
						will be copied into invoice #{nextInvoiceNumber}.
					</p>
				</form>
			</ResponsiveModal>
		</>
	);
}

function toDuplicateInvoice(
	invoice: InvoiceType,
	name: string,
	invoiceNumber: number,
): InvoiceInsertType {
	return {
		name,
		subject: name,
		date: invoice.date,
		clientId: invoice.clientId,
		invoiceNumber,
		clientNumber: invoice.clientNumber,
		introduction: invoice.introduction,
		footNote: invoice.footNote,
		currency: invoice.currency,
		language: invoice.language,
		hourlyRate: invoice.hourlyRate,
		invoiceLocation: invoice.invoiceLocation,
		rows: invoice.rows.map((row) => ({ ...row })),
	};
}

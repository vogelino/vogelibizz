import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import type { InvoiceType, SettingsType } from "@/db/schema";
import { InvoicePdfPreview } from "@/features/invoices/InvoicePdfPreview";
import { buildInvoicePdfData } from "@/features/invoices/invoicePdfData";
import { parseId } from "@/utility/resourceUtil";

const pdfSearchSchema = z.object({
	invoiceId: z.union([z.string(), z.number()]).optional(),
});

export const Route = createFileRoute("/pdf")({
	validateSearch: pdfSearchSchema,
	beforeLoad: async () => {
		if (!import.meta.env.SSR) return;
		const [{ getStartContext }, { getSession }, { authConfig }, envModule] =
			await Promise.all([
				import("@tanstack/start-storage-context"),
				import("start-authjs"),
				import("@/utils/auth"),
				import("@/env"),
			]);
		const request = getStartContext({ throwIfNotFound: false })?.request;
		if (!request) return;
		const session = await getSession(request, authConfig);
		const email = session?.user?.email;
		const authenticated =
			!!email && envModule.default.server.AUTH_ADMIN_EMAILS.includes(email);
		if (!authenticated) throw redirect({ to: "/login" });
	},
	loaderDeps: ({ search }) => ({ invoiceId: search.invoiceId }),
	loader: async ({ deps }) => {
		if (!deps.invoiceId) {
			return { invoice: null, settings: null };
		}
		const invoiceId = parseId(deps.invoiceId);
		const [{ getInvoice }, { getSettings }] = await Promise.all([
			import("@/server/api/invoices/getInvoice.js"),
			import("@/server/api/settings/getSettings.js"),
		]);
		const [invoice, settings] = await Promise.all([
			getInvoice(invoiceId),
			getSettings(),
		]);
		return { invoice, settings };
	},
	component: PdfRouteComponent,
});

function PdfRouteComponent() {
	const { invoice, settings } = Route.useLoaderData() as {
		invoice: InvoiceType | null;
		settings: SettingsType | null;
	};
	if (!invoice || !settings) {
		return (
			<div className="flex h-screen items-center justify-center p-6 text-center text-muted-foreground">
				Provide an invoiceId search param to preview an invoice PDF.
			</div>
		);
	}

	return (
		<div className="h-screen w-screen bg-background">
			<InvoicePdfPreview data={buildInvoicePdfData(invoice, settings)} />
		</div>
	);
}

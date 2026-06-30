import { createFileRoute } from "@tanstack/react-router";
import { isAuthenticatedAndAdmin } from "@/auth";
import { buildInvoicePdfData } from "@/features/invoices/invoicePdfData";
import { json } from "@/utility/apiUtil";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/api/pdf")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const allowed = await isAuthenticatedAndAdmin(undefined, request);
				if (!allowed) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}
				try {
					const url = new URL(request.url);
					const invoiceId = url.searchParams.get("invoiceId");
					if (!invoiceId) {
						return json(
							{ error: "Missing invoiceId search param" },
							{ status: 400 },
						);
					}
					const parsedId = parseId(invoiceId);
					const [{ getInvoice }, { getSettings }] = await Promise.all([
						import("@/server/api/invoices/getInvoice"),
						import("@/server/api/settings/getSettings"),
					]);
					const [invoice, settings] = await Promise.all([
						getInvoice(parsedId),
						getSettings(),
					]);
					return json(buildInvoicePdfData(invoice, settings));
				} catch (error) {
					return json(
						{
							error: error instanceof Error ? error.message : "Invalid request",
						},
						{ status: 400 },
					);
				}
			},
		},
	},
});

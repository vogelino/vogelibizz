import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/invoices")({
	server: {
		handlers: {
			GET: async () => {
				const { getInvoices } = await import(
					"@/server/api/invoices/getInvoices"
				);
				return json(await getInvoices());
			},
			POST: async ({ request }) => {
				const body = await request.json();
				const [{ invoiceInsertSchema, invoices }, { default: db }] =
					await Promise.all([import("@/db/schema"), import("@/db")]);
				const parsedBody = invoiceInsertSchema.array().parse(body);
				if (parsedBody.length === 0) {
					return json(
						{ error: "At least one invoice is required." },
						{ status: 400 },
					);
				}
				const insertedInvoices = await db
					.insert(invoices)
					.values(parsedBody)
					.returning();
				return json(insertedInvoices.map((invoice) => invoice.id));
			},
		},
	},
});

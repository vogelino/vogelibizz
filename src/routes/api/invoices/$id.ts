import { createFileRoute } from "@tanstack/react-router";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";

export const Route = createFileRoute("/api/invoices/$id")({
	server: {
		handlers: {
			GET: getQueryRouteWithId(
				async (id) => {
					const { getInvoice } = await import(
						"@/server/api/invoices/getInvoice"
					);
					return getInvoice(id);
				},
				(id) => `Invoice with id '${id}' does not exist`,
			),
			PATCH: getEditionRoute(async (id, body) => {
				const [{ invoiceEditSchema, invoices }, { default: db }, { eq }] =
					await Promise.all([
						import("@/db/schema"),
						import("@/db"),
						import("drizzle-orm"),
					]);
				const parsedBody = invoiceEditSchema.parse({ ...(body as object), id });
				await db.update(invoices).set(parsedBody).where(eq(invoices.id, id));
			}),
			DELETE: getDeletionRoute(async (id) => {
				const [{ invoices, projectsToInvoices }, { default: db }, { eq }] =
					await Promise.all([
						import("@/db/schema"),
						import("@/db"),
						import("drizzle-orm"),
					]);
				await db
					.delete(projectsToInvoices)
					.where(eq(projectsToInvoices.invoiceId, id));
				await db.delete(invoices).where(eq(invoices.id, id));
			}),
		},
	},
});

import { createFileRoute } from "@tanstack/react-router";

import { getDeletionRoute, getEditionRoute, getQueryRouteWithId } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/invoices/$id")({
  server: {
    handlers: {
      GET: getQueryRouteWithId(
        async (id) => {
          const { getInvoice } = await import("@/server/api/invoices/getInvoice");
          return getInvoice(id);
        },
        (id) => `Invoice with id '${id}' does not exist`,
      ),
      PATCH: getEditionRoute(async (id, body) => {
        const [{ invoiceEditSchema, invoices, projectsToInvoices }, { default: db }, { eq }] =
          await Promise.all([import("@/db/schema"), import("@/db"), import("drizzle-orm")]);
        const parsedBody = invoiceEditSchema.parse({ ...(body as object), id });
        const { projects, ...invoice } = parsedBody;
        await db.update(invoices).set(invoice).where(eq(invoices.id, id));
        if (projects !== undefined) {
          await db.delete(projectsToInvoices).where(eq(projectsToInvoices.invoiceId, id));
          if (projects.length > 0) {
            await db.insert(projectsToInvoices).values(
              projects.map((project) => ({
                projectId: project.id,
                invoiceId: id,
              })),
            );
          }
        }
      }),
      DELETE: getDeletionRoute(async (id) => {
        const [{ invoices, projectsToInvoices }, { default: db }, { eq }] = await Promise.all([
          import("@/db/schema"),
          import("@/db"),
          import("drizzle-orm"),
        ]);
        await db.delete(projectsToInvoices).where(eq(projectsToInvoices.invoiceId, id));
        await db.delete(invoices).where(eq(invoices.id, id));
      }),
    },
  },
});

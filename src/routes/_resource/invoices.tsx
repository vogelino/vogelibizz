import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

import ResourcePageLayout from "@/components/ResourcePageLayout";
import { currencyEnum } from "@/db/schema";
import InvoicesList from "@/features/invoices/InvoicesList";

export const Route = createFileRoute("/_resource/invoices")({
  validateSearch: z.object({
    q: z.string().trim().min(1).optional().catch(undefined),
    clientIds: z.array(z.string().regex(/^\d+$/)).optional().catch(undefined),
    projectIds: z.array(z.string().regex(/^\d+$/)).optional().catch(undefined),
    currencies: z.array(z.enum(currencyEnum.enumValues)).optional().catch(undefined),
  }),
  component: InvoicesLayout,
  pendingComponent: InvoicesPending,
});

function InvoicesLayout() {
  return (
    <ResourcePageLayout resource="invoices">
      <Outlet />
    </ResourcePageLayout>
  );
}

function InvoicesPending() {
  return (
    <ResourcePageLayout resource="invoices">
      <InvoicesList loading />
    </ResourcePageLayout>
  );
}

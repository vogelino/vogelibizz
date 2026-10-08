import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { type InvoiceInsertType, invoiceInsertSchema } from "@/db/schema";
import InvoicesList from "@/features/invoices/InvoicesList";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { invoiceQueryOptions, invoicesQueryOptions } from "@/utility/data/queryOptions";
import useInvoices from "@/utility/data/useInvoices";

export const Route = createFileRoute("/_resource/invoices/create")({
  validateSearch: z.object({
    duplicateId: z.coerce.number().pipe(z.int().positive()).optional(),
  }),
  loader: async ({ context }) => {
    if (import.meta.env.SSR) {
      const { getInvoices } = await import("@/server/api/invoices/getInvoices.js");
      const invoices = await getInvoices();
      context.queryClient.setQueryData(invoicesQueryOptions().queryKey, invoices);
      return { invoices };
    }
    void context.queryClient.prefetchQuery(invoicesQueryOptions());
    return {};
  },
  component: InvoiceCreateRoute,
});

const createInvoice = createQueryFunction<number[], InvoiceInsertType[]>({
  resourceName: "invoices",
  action: "create",
  inputZodSchema: invoiceInsertSchema.array(),
});

function InvoiceCreateRoute() {
  const { duplicateId } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const startedRef = useRef(false);
  const invoicesQuery = useInvoices();
  const createMutation = useMutation({
    mutationKey: ["invoices", "create", "auto"],
    mutationFn: createInvoice,
    onSuccess: async (ids) => {
      const createdId = ids[0];
      if (typeof createdId !== "number") {
        throw new Error("Invoice creation did not return an id.");
      }
      await queryClient.invalidateQueries({
        queryKey: invoicesQueryOptions().queryKey,
      });
      await queryClient.prefetchQuery(invoiceQueryOptions(createdId));
      navigate({
        to: "/invoices/$id",
        params: { id: String(createdId) },
        search: true,
      });
    },
  });

  useEffect(() => {
    if (startedRef.current) return;
    if (invoicesQuery.isPending) return;
    startedRef.current = true;
    const duplicate = duplicateId
      ? invoicesQuery.data?.find((invoice) => invoice.id === duplicateId)
      : undefined;
    if (duplicateId && !duplicate) {
      createMutation.mutate([], {
        onError: () => {
          startedRef.current = false;
        },
      });
      return;
    }
    const nextInvoiceNumber =
      (invoicesQuery.data ?? []).reduce(
        (maxValue, invoice) => Math.max(maxValue, invoice.invoiceNumber),
        0,
      ) + 1;
    if (duplicate) {
      createMutation.mutate([
        {
          name: `copy ${duplicate.name}`,
          subject: `copy ${duplicate.subject || duplicate.name}`,
          date: duplicate.date,
          clientId: duplicate.clientId,
          invoiceNumber: nextInvoiceNumber,
          clientNumber: duplicate.clientNumber,
          introduction: duplicate.introduction,
          footNote: duplicate.footNote,
          currency: duplicate.currency,
          language: duplicate.language,
          hourlyRate: duplicate.hourlyRate,
          invoiceLocation: duplicate.invoiceLocation,
          rows: duplicate.rows.map((row) => ({ ...row })),
        },
      ]);
      return;
    }
    const name = `Invoice ${nextInvoiceNumber}`;
    createMutation.mutate([
      {
        name,
        subject: name,
        invoiceNumber: nextInvoiceNumber,
        date: new Date().toISOString().slice(0, 10),
        rows: [],
      },
    ]);
  }, [createMutation, duplicateId, invoicesQuery.data, invoicesQuery.isPending]);

  return (
    <>
      <InvoicesList />
      <ResponsiveModal
        open
        title={duplicateId ? "Duplicate invoice" : "Create invoice"}
        onClose={() => navigate({ to: "/invoices", search: true })}
      >
        {createMutation.isError ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Could not create invoice</h2>
            <p className="text-sm text-muted-foreground">{String(createMutation.error)}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  startedRef.current = false;
                  createMutation.reset();
                }}
              >
                Try again
              </Button>
              <Button asChild variant="outline">
                <Link to="/invoices" search>
                  Back to invoices
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            {duplicateId ? "Duplicating invoice..." : "Creating invoice..."}
          </div>
        )}
      </ResponsiveModal>
    </>
  );
}

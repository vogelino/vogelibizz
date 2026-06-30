import { createFileRoute } from "@tanstack/react-router";
import InvoicesList from "@/features/invoices/InvoicesList";
import { invoicesQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/invoices/")({
	loader: async ({ context }) => {
		if (import.meta.env.SSR) {
			const { getInvoices } = await import(
				"@/server/api/invoices/getInvoices.js"
			);
			const invoices = await getInvoices();
			context.queryClient.setQueryData(
				invoicesQueryOptions().queryKey,
				invoices,
			);
			return { invoices };
		}
		void context.queryClient.prefetchQuery(invoicesQueryOptions());
		return {};
	},
	component: InvoicesList,
});

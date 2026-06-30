import { createFileRoute } from "@tanstack/react-router";
import InvoiceEditorPage from "@/features/invoices/InvoiceEditorPage";
import { invoiceQueryOptions } from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/invoices/$id")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		if (import.meta.env.SSR) {
			const { getInvoice } = await import(
				"@/server/api/invoices/getInvoice.js"
			);
			const invoice = await getInvoice(parsedId);
			context.queryClient.setQueryData(
				invoiceQueryOptions(parsedId).queryKey,
				invoice,
			);
			return { invoice };
		}
		void context.queryClient.prefetchQuery(invoiceQueryOptions(parsedId));
		return {};
	},
	component: InvoiceDetailRoute,
});

function InvoiceDetailRoute() {
	const { id } = Route.useParams();
	const { invoice } = Route.useLoaderData();
	return <InvoiceEditorPage id={parseId(id)} initialData={invoice} />;
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import InvoiceEditorPage from "@/features/invoices/InvoiceEditorPage";
import InvoicesList from "@/features/invoices/InvoicesList";
import {
	invoiceQueryOptions,
	invoicesQueryOptions,
} from "@/utility/data/queryOptions";
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
			await context.queryClient.ensureQueryData(invoicesQueryOptions());
			return { invoice };
		}
		await Promise.all([
			context.queryClient.ensureQueryData(invoiceQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(invoicesQueryOptions()),
		]);
		return {};
	},
	component: InvoiceDetailRoute,
});

function InvoiceDetailRoute() {
	const { id } = Route.useParams();
	const { invoice } = Route.useLoaderData();
	const navigate = useNavigate();
	return (
		<>
			<InvoicesList />
			<ResponsiveModal
				open
				wide
				onClose={() => navigate({ to: "/invoices", search: true })}
				title={invoice?.name || `Invoice ${id}`}
			>
				<InvoiceEditorPage id={parseId(id)} initialData={invoice} />
			</ResponsiveModal>
		</>
	);
}

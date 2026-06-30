import { createFileRoute, Outlet } from "@tanstack/react-router";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import InvoicesList from "@/features/invoices/InvoicesList";

export const Route = createFileRoute("/_resource/invoices")({
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

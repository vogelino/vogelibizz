import { createFileRoute, Outlet } from "@tanstack/react-router";
import ClientList from "@/features/clients/ClientsList";
import ResourcePageLayout from "@/components/ResourcePageLayout";

export const Route = createFileRoute("/_resource/clients")({
	component: ClientsLayout,
	pendingComponent: ClientsPending,
});

function ClientsLayout() {
	return (
		<ResourcePageLayout resource="clients">
			<Outlet />
		</ResourcePageLayout>
	);
}

function ClientsPending() {
	return (
		<ResourcePageLayout resource="clients">
			<ClientList loading />
		</ResourcePageLayout>
	);
}

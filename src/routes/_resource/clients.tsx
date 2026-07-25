import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import ClientList from "@/features/clients/ClientsList";

export const Route = createFileRoute("/_resource/clients")({
	validateSearch: z.object({
		q: z.string().trim().min(1).optional().catch(undefined),
	}),
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

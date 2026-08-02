import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import { clientLanguageEnum } from "@/db/schema";
import ClientList from "@/features/clients/ClientsList";

export const Route = createFileRoute("/_resource/clients")({
	validateSearch: z.object({
		q: z.string().trim().min(1).optional().catch(undefined),
		languages: z
			.array(z.enum(clientLanguageEnum.enumValues))
			.optional()
			.catch(undefined),
		projectIds: z.array(z.string().regex(/^\d+$/)).optional().catch(undefined),
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

import { createFileRoute, Outlet } from "@tanstack/react-router";
import ResourcePageLayout from "@/components/ResourcePageLayout";

export const Route = createFileRoute("/_resource/clients")({
	component: ClientsLayout,
});

function ClientsLayout() {
	return (
		<ResourcePageLayout resource="clients">
			<Outlet />
		</ResourcePageLayout>
	);
}

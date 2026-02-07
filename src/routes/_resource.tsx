import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/_resource")({
	component: ResourceLayout,
});

function ResourceLayout() {
	return (
		<PageLayout>
			<Outlet />
		</PageLayout>
	);
}

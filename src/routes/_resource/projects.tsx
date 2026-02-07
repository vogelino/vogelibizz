import { createFileRoute, Outlet } from "@tanstack/react-router";
import ResourcePageLayout from "@/components/ResourcePageLayout";

export const Route = createFileRoute("/_resource/projects")({
	component: ProjectsLayout,
});

function ProjectsLayout() {
	return (
		<ResourcePageLayout resource="projects">
			<Outlet />
		</ResourcePageLayout>
	);
}

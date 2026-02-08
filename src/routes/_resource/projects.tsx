import { createFileRoute, Outlet } from "@tanstack/react-router";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import ProjectList from "@/features/projects/ProjectsList";

export const Route = createFileRoute("/_resource/projects")({
	component: ProjectsLayout,
	pendingComponent: ProjectsPending,
});

function ProjectsLayout() {
	return (
		<ResourcePageLayout resource="projects">
			<Outlet />
		</ResourcePageLayout>
	);
}

function ProjectsPending() {
	return (
		<ResourcePageLayout resource="projects">
			<ProjectList loading />
		</ResourcePageLayout>
	);
}

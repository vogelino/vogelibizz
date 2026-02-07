import { createFileRoute } from "@tanstack/react-router";
import ProjectList from "@/features/projects/ProjectsList";

export const Route = createFileRoute("/_resource/projects/")({
	component: ProjectList,
});

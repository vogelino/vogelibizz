import { createFileRoute } from "@tanstack/react-router";
import ProjectList from "@/app/(resource-pages)/projects/(show)/page.client";

export const Route = createFileRoute("/_resource/projects/")({
	component: ProjectList,
});

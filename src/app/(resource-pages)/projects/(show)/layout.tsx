import type { ReactNode } from "react";
import ResourcePageLayout from "@/components/ResourcePageLayout";

function ProjectsLayout({ children }: { children: ReactNode }) {
	return (
		<ResourcePageLayout resource="projects">{children}</ResourcePageLayout>
	);
}

export default ProjectsLayout;

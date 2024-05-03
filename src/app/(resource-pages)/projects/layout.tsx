import ResourcePageLayout from "@/components/ResourcePageLayout";
import type { ReactNode } from "react";

function ProjectsLayout({ children }: { children: ReactNode }) {
	return (
		<ResourcePageLayout resource="projects">{children}</ResourcePageLayout>
	);
}

export default ProjectsLayout;

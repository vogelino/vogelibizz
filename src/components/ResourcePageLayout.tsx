import ResourceCreateButton from "@/components/ResourceCreateButton";
import type { ResourceType } from "@/db/schema";
import type { ReactNode } from "react";

function ResourcePageLayout({
	resource,
	children,
}: {
	resource: ResourceType;
	children: ReactNode;
}) {
	return (
		<div className="px-10 pb-8">
			<div className="flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center">
				<h1 className="font-special text-3xl antialiased">{resource}</h1>
				<ResourceCreateButton resource={resource} />
			</div>
			{children}
		</div>
	);
}

export default ResourcePageLayout;

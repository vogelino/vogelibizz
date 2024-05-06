"use client";
import type { ResourceType } from "@/db/schema";
import { Link } from "next-view-transitions";
import { Button } from "../ui/button";

function ResourceCreateButton({
	resource,
}: {
	resource: ResourceType;
}) {
	return (
		<Button variant="outline" asChild>
			<Link href={`/${resource}/create`}>
				Create {resource.toLocaleLowerCase().replace(/s$/, "")}
			</Link>
		</Button>
	);
}

export default ResourceCreateButton;

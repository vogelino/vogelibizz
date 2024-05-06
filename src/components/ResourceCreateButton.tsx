"use client";
import { Button } from "@/components/ui/button";
import type { ResourceType } from "@/db/schema";
import Link from "next/link";

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

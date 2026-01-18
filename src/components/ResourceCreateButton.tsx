"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ResourceType } from "@/db/schema";

function ResourceCreateButton({ resource }: { resource: ResourceType }) {
	return (
		<Button variant="outline" asChild>
			<Link href={`/${resource}/create`}>
				Create {resource.toLocaleLowerCase().replace(/s$/, "")}
			</Link>
		</Button>
	);
}

export default ResourceCreateButton;

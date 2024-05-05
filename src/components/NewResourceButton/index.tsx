"use client";
import type { ResourceType } from "@/db/schema";
import { Link } from "next-view-transitions";
import { Button } from "../ui/button";

function ResourceButton({
	resource,
	action: actionName,
}: {
	resource: string;
	action: ResourceType;
}) {
	return (
		<Button variant="outline" asChild>
			<Link href={`/${resource}/${actionName}`}>
				{ucFirst(actionName)} {resource.toLocaleLowerCase().replace(/s$/, "")}
			</Link>
		</Button>
	);
}

function ucFirst(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default ResourceButton;

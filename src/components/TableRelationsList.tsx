import type { ResourceType } from "@/db/schema";
import Link from "next/link";
import { IconBadge } from "./ui/icon-badge";

function TableRelationsList({
	originalId,
	items = [],
	maxItems = 2,
	originalResource,
	relationResource,
}: {
	originalId: number;
	originalResource: ResourceType;
	relationResource: ResourceType;
	items: { id: number; name: string }[];
	maxItems?: number;
}) {
	const displayProjects = items.slice(0, maxItems);
	const isMore = items.length > maxItems;
	return (
		<div className="flex gap-2">
			{displayProjects.map((project) => (
				<Link key={project.id} href={`/${relationResource}/edit/${project.id}`}>
					<IconBadge
						icon={null}
						label={project.name}
						className="m-0 max-w-36"
					/>
				</Link>
			))}
			{isMore && (
				<Link href={`/${originalResource}/edit/${originalId}`}>
					<IconBadge
						icon={null}
						label={`+${items.length - maxItems}`}
						className="m-0 text-grayDark"
					/>
				</Link>
			)}
		</div>
	);
}

export default TableRelationsList;

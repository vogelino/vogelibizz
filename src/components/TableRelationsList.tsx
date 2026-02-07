import { Link } from "@tanstack/react-router";
import type { ResourceType } from "@/db/schema";
import { IconBadge } from "./ui/icon-badge";

function TableRelationsList({
	originalId,
	items = [],
	maxItems = 2,
	originalResource,
	relationResource,
	useModalLinks = false,
}: {
	originalId: number;
	originalResource: ResourceType;
	relationResource: ResourceType;
	items: { id: number; name: string }[];
	maxItems?: number;
	useModalLinks?: boolean;
}) {
	const displayProjects = items.slice(0, maxItems);
	const isMore = items.length > maxItems;
	return (
		<div className="flex gap-2">
			{displayProjects.map((project) => (
				<Link
					key={project.id}
					to={
						useModalLinks
							? `/${relationResource}/edit/${project.id}/modal`
							: `/${relationResource}/edit/${project.id}`
					}
					mask={
						useModalLinks
							? {
									to: `/${relationResource}/edit/$id`,
									params: { id: String(project.id) },
									unmaskOnReload: true,
								}
							: undefined
					}
					className="focusable"
				>
					<IconBadge
						icon={null}
						label={project.name}
						className="m-0 max-w-36"
					/>
				</Link>
			))}
			{isMore && (
				<Link
					to={
						useModalLinks
							? `/${originalResource}/edit/${originalId}/modal`
							: `/${originalResource}/edit/${originalId}`
					}
					mask={
						useModalLinks
							? {
									to: `/${originalResource}/edit/$id`,
									params: { id: String(originalId) },
									unmaskOnReload: true,
								}
							: undefined
					}
					className="focusable"
				>
					<IconBadge
						icon={null}
						label={`+${items.length - maxItems}`}
						className="m-0 text-muted-foreground"
					/>
				</Link>
			)}
		</div>
	);
}

export default TableRelationsList;

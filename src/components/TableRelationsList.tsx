import { Link, linkOptions } from "@tanstack/react-router";
import { IconBadge } from "./ui/icon-badge";
import type { RoutedResource } from "@/utility/routedResources";

function TableRelationsList({
	originalId,
	items = [],
	maxItems = 2,
	originalResource,
	relationResource,
	useModalLinks = false,
}: {
	originalId: number;
	originalResource: RoutedResource;
	relationResource: RoutedResource;
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
					{...getEditLink(relationResource, project.id, useModalLinks)}
					mask={
						useModalLinks
							? {
									...getEditLink(relationResource, project.id, false),
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
					{...getEditLink(originalResource, originalId, useModalLinks)}
					mask={
						useModalLinks
							? {
									...getEditLink(originalResource, originalId, false),
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

function getEditLink(resource: RoutedResource, id: number, modal: boolean) {
	const params = { id: String(id) };
	switch (resource) {
		case "clients":
			return modal
				? linkOptions({ to: "/clients/edit/$id/modal", params })
				: linkOptions({ to: "/clients/edit/$id", params });
		case "expenses":
			return modal
				? linkOptions({ to: "/expenses/edit/$id/modal", params })
				: linkOptions({ to: "/expenses/edit/$id", params });
		case "projects":
			return modal
				? linkOptions({ to: "/projects/edit/$id/modal", params })
				: linkOptions({ to: "/projects/edit/$id", params });
		default: {
			const _exhaustive: never = resource;
			throw new Error(`Unhandled resource ${_exhaustive}`);
		}
	}
}

export default TableRelationsList;

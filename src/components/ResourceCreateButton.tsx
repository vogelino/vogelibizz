"use client";
import { Link, linkOptions } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { RoutedResource } from "@/utility/routedResources";

function ResourceCreateButton({ resource }: { resource: RoutedResource }) {
	const createRoute = getCreateRoute(resource);
	const maskRoute = getCreateMaskRoute(resource);
	return (
		<Button variant="outline" asChild>
			<Link
				{...createRoute}
				mask={{
					...maskRoute,
					unmaskOnReload: true,
				}}
			>
				Create {resource.toLocaleLowerCase().replace(/s$/, "")}
			</Link>
		</Button>
	);
}

function getCreateRoute(resource: RoutedResource) {
	switch (resource) {
		case "clients":
			return linkOptions({ to: "/clients/create/modal" });
		case "expenses":
			return linkOptions({ to: "/expenses/create/modal" });
		case "projects":
			return linkOptions({ to: "/projects/create/modal" });
		default: {
			const _exhaustive: never = resource;
			throw new Error(`Unhandled resource ${_exhaustive}`);
		}
	}
}

function getCreateMaskRoute(resource: RoutedResource) {
	switch (resource) {
		case "clients":
			return linkOptions({ to: "/clients/create" });
		case "expenses":
			return linkOptions({ to: "/expenses/create" });
		case "projects":
			return linkOptions({ to: "/projects/create" });
		default: {
			const _exhaustive: never = resource;
			throw new Error(`Unhandled resource ${_exhaustive}`);
		}
	}
}

export default ResourceCreateButton;

"use client";
import {
	Link,
	linkOptions,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import type { RoutedResource } from "@/utility/routedResources";

export default function EditResourceModal({
	resource,
	crudAction,
	id,
	formId,
	title,
	children,
}: PropsWithChildren<{
	resource: RoutedResource;
	crudAction: "create" | "edit";
	id?: string | number;
	formId?: string;
	title?: string;
}>) {
	const resourcePluralName = resource;
	const listRoute = getListRoute(resource);
	const navigate = useNavigate();
	const pathname = useLocation().pathname;
	const actionLabel = crudAction === "create" ? "Create" : "Edit";
	const label = `${actionLabel} ${resource.toLocaleLowerCase().replace(/s$/, "")}`;
	const expectedPathname = `/${resourcePluralName}/${crudAction}${
		id ? `/${id}` : ""
	}`;
	const isOpened = pathname === expectedPathname;
	return (
		<ResponsiveModal
			open={isOpened}
			title={<PageHeaderTitle name={title || label} id={id} />}
			onClose={() => navigate({ ...listRoute })}
			footer={
				<>
					<Button asChild variant="outline">
						<Link {...listRoute}>Cancel</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						{label}
					</Button>
				</>
			}
		>
			{children}
		</ResponsiveModal>
	);
}

function getListRoute(resource: RoutedResource) {
	switch (resource) {
		case "clients":
			return linkOptions({ to: "/clients" });
		case "expenses":
			return linkOptions({ to: "/expenses" });
		case "projects":
			return linkOptions({ to: "/projects" });
		default: {
			const _exhaustive: never = resource;
			throw new Error(`Unhandled resource ${_exhaustive}`);
		}
	}
}

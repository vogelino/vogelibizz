"use client";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";

export default function EditResourceModal({
	resourceSingularName,
	crudAction,
	id,
	formId,
	title,
	children,
}: PropsWithChildren<{
	resourceSingularName: string;
	crudAction: "create" | "edit";
	id?: string | number;
	formId?: string;
	title?: string;
}>) {
	const resourcePluralName = `${resourceSingularName}s`.toLowerCase();
	const navigate = useNavigate();
	const pathname = useLocation().pathname;
	const actionLabel = crudAction === "create" ? "Create" : "Edit";
	const label = `${actionLabel} ${resourceSingularName.toLocaleLowerCase()}`;
	const expectedPathname = `/${resourcePluralName}/${crudAction}${
		id ? `/${id}` : ""
	}`;
	const isOpened = pathname === expectedPathname;
	return (
		<ResponsiveModal
			open={isOpened}
			title={<PageHeaderTitle name={title || label} id={id} />}
			onClose={() => navigate({ to: `/${resourcePluralName}` })}
			footer={
				<>
					<Button asChild variant="outline">
						<Link to={`/${resourcePluralName}`}>Cancel</Link>
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

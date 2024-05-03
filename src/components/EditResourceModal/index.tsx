"use client";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { SaveIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import { usePathname, useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";

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
	id?: string;
	formId?: string;
	title?: string;
}>) {
	const resourcePluralName = `${resourceSingularName}s`.toLowerCase();
	const router = useRouter();
	const pathname = usePathname();
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
			onClose={() => router.push(`/${resourcePluralName}`)}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/${resourcePluralName}`}>Cancel</Link>
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

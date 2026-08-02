"use client";

import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import ExpenseEdit from "@/components/ExpenseEdit";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import type {
	ClientType,
	ExpenseWithMonthlyCLPPriceType,
	ProjectType,
	ResourceType,
} from "@/db/schema";

const formId = "bulk-edit-resource-form";

export default function BulkEditDrawer({
	resource,
	rows,
	open,
	onClose,
}: {
	resource: Extract<ResourceType, "clients" | "projects" | "expenses">;
	rows: unknown[];
	open: boolean;
	onClose: () => void;
}) {
	const count = rows.length;
	const singular = resource.replace(/s$/, "");
	return (
		<ResponsiveModal
			open={open}
			title={`Edit ${count} ${count === 1 ? singular : resource}`}
			description="Only fields you change will be applied to every selected row."
			onClose={onClose}
			footer={
				<>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						Apply to {count}
					</Button>
				</>
			}
		>
			{resource === "clients" && (
				<ClientEdit
					formId={formId}
					bulkItems={rows as ClientType[]}
					onBulkComplete={onClose}
				/>
			)}
			{resource === "projects" && (
				<ProjectEdit
					formId={formId}
					bulkItems={rows as ProjectType[]}
					onBulkComplete={onClose}
				/>
			)}
			{resource === "expenses" && (
				<ExpenseEdit
					formId={formId}
					bulkItems={rows as ExpenseWithMonthlyCLPPriceType[]}
					onBulkComplete={onClose}
				/>
			)}
		</ResponsiveModal>
	);
}

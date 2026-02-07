"use client";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { singularizeResourceName } from "@/utility/resourceUtil";

const resource = "clients";
const resourceSingular = singularizeResourceName(resource);
const action = "create";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
const formId = `${resource}-${action}-form`;

export const dynamic = "force-dynamic";
export default function ClientCreateModalRoute() {
	const navigate = useNavigate();
	const pathname = useLocation().pathname;
	return (
		<ResponsiveModal
			open={pathname === `/${resource}/${action}`}
			title={
				<PageHeaderTitle name={`${capitalizedAction} ${resourceSingular}`} />
			}
			onClose={() => navigate({ to: "/clients" })}
			footer={
				<>
					<Button asChild variant="outline">
						<Link to={`/${resource}`}>Cancel</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						{"Create client"}
					</Button>
				</>
			}
		>
			<ClientEdit formId={formId} />
		</ResponsiveModal>
	);
}

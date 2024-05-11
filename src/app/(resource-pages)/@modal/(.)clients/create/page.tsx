"use client";
import ClientEdit from "@/components/ClientEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { singularizeResourceName } from "@/utility/resourceUtil";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const resource = "clients";
const resourceSingular = singularizeResourceName(resource);
const action = "create";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
const formId = `${resource}-${action}-form`;

export const dynamic = "force-dynamic";
export default function ClientCreateModalRoute() {
	const router = useRouter();
	const pathname = usePathname();
	return (
		<ResponsiveModal
			open={pathname === `/${resource}/${action}`}
			title={
				<PageHeaderTitle name={`${capitalizedAction} ${resourceSingular}`} />
			}
			onClose={() => router.push("/clients")}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/${resource}`}>Cancel</Link>
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

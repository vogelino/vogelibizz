"use client";
import ClientEdit from "@/components/ClientEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import useClient from "@/utility/data/useClient";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";
export default function ClientEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const pathname = usePathname();
	const { data } = useClient(+id);
	return (
		<ResponsiveModal
			open={pathname === `/clients/edit/${id}`}
			title={<PageHeaderTitle name={data?.name || "Edit client"} id={id} />}
			description={"Edit Client"}
			onClose={() => router.push("/clients")}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/clients`}>Cancel</Link>
					</Button>
					{id && (
						<Button type="submit" form={`client-edit-form-${id}`}>
							<SaveIcon />
							{"Edit client"}
						</Button>
					)}
				</>
			}
		>
			<ClientEdit id={id} />
		</ResponsiveModal>
	);
}

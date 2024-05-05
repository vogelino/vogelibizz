"use client";
import ClientDisplay from "@/components/ClientDisplay";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import useClient from "@/utility/data/useClient";
import { PencilIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import { usePathname, useRouter } from "next/navigation";

export default function ClientShow({
	params: { id },
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const pathname = usePathname();
	const { data } = useClient(+id);
	return (
		<ResponsiveModal
			open={pathname === `/clients/show/${id}`}
			title={<PageHeaderTitle name={data?.name || "Edit client"} id={id} />}
			description={"Client details"}
			onClose={() => router.push("/clients")}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/clients`}>Close</Link>
					</Button>
					{id && (
						<Button asChild>
							<Link href={`/clients/edit/${id}`}>
								<PencilIcon />
								{"Edit"}
							</Link>
						</Button>
					)}
				</>
			}
		>
			<ClientDisplay id={id} />
		</ResponsiveModal>
	);
}

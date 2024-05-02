"use client";
import ClientCreate from "@components/ClientCreate";
import PageHeaderTitle from "@components/PageHeaderTitle";
import { Button } from "@components/ui/button";
import { ResponsiveModal } from "@components/ui/responsive-dialog";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function ClientCreateModalRoute() {
	const router = useRouter();
	const pathname = usePathname();
	return (
		<ResponsiveModal
			open={pathname === `/clients/create`}
			title={<PageHeaderTitle name="Create client" />}
			onClose={() => router.push("/clients")}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/clients`}>Cancel</Link>
					</Button>
					<Button type="submit" form={`client-create-form`}>
						<SaveIcon />
						{"Create client"}
					</Button>
				</>
			}
		>
			<ClientCreate />
		</ResponsiveModal>
	);
}

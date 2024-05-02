import ClientCreate from "@components/ClientCreate";
import FormPageLayout from "@components/FormPageLayout";
import { Button } from "@components/ui/button";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ClientCreatePageRoute() {
	return (
		<FormPageLayout
			title="Create Client"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/clients`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`client-create-form`}>
						<SaveIcon />
						{"Create client"}
					</Button>
				</>
			}
		>
			<ClientCreate />
		</FormPageLayout>
	);
}

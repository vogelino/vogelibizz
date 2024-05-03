import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { Link } from "next-view-transitions";

export default function ClientEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	return (
		<FormPageLayout
			id={id}
			title="Edit Client"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/clients/show/${id}`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`client-edit-form-${id}`}>
						<SaveIcon />
						{"Save client"}
					</Button>
				</>
			}
		>
			<ClientEdit id={id} />
		</FormPageLayout>
	);
}

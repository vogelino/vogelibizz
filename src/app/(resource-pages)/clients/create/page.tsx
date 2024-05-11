import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { singularizeResourceName } from "@/utility/resourceUtil";
import { SaveIcon } from "lucide-react";
import Link from "next/link";

const resource = "clients";
const resourceSingular = singularizeResourceName(resource);
const action = "create";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
const formId = `${resource}-${action}-form`;

export default function ClientCreatePageRoute() {
	return (
		<FormPageLayout
			title={`${capitalizedAction} ${resourceSingular}`}
			allLink={`/${resource}`}
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/${resource}`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						{`${capitalizedAction} ${resourceSingular}`}
					</Button>
				</>
			}
		>
			<ClientEdit formId={formId} />
		</FormPageLayout>
	);
}

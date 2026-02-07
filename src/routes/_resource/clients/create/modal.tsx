import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientList from "@/features/clients/ClientsList";
import ClientEdit from "@/components/ClientEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";

export const Route = createFileRoute("/_resource/clients/create/modal")({
	component: ClientCreateModal,
});

function ClientCreateModal() {
	const navigate = useNavigate();
	const formId = "client-create-form";

	return (
		<>
			<ClientList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Create client" />}
				onClose={() => navigate({ to: "/clients" })}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() => navigate({ to: "/clients" })}
							>
								Cancel
							</button>
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
		</>
	);
}

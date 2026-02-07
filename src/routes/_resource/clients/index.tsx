import { createFileRoute } from "@tanstack/react-router";
import ClientList from "@/features/clients/ClientsList";

export const Route = createFileRoute("/_resource/clients/")({
	component: ClientList,
});

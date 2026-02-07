import { createFileRoute } from "@tanstack/react-router";
import ClientList from "@/app/(resource-pages)/clients/(show)/page.client";

export const Route = createFileRoute("/_resource/clients/")({
	component: ClientList,
});

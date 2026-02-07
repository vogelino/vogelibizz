import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuthenticatedAndAdmin } from "@/auth";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const authenticatedAndAdmin = await isAuthenticatedAndAdmin();
		throw redirect({
			to: authenticatedAndAdmin ? "/projects" : "/login",
		});
	},
});

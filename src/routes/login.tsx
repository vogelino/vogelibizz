import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuthenticatedAndAdmin } from "@/auth";
import { SignInButton } from "@/components/SignInButton";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		if (await isAuthenticatedAndAdmin()) {
			throw redirect({ to: "/projects" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<SignInButton />
		</div>
	);
}

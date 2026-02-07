import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { SignInButton } from "@/components/SignInButton";
import { useSession } from "@/providers/SessionProvider";

export const Route = createFileRoute("/login")({
	beforeLoad: async ({ context }) => {
		if (typeof window !== "undefined") return;
		const request = (context as { request?: Request })?.request;
		if (!request) return;
		const [{ getSession }, { authConfig }, envModule] = await Promise.all([
			import("start-authjs"),
			import("@/utils/auth"),
			import("@/env"),
		]);
		const session = await getSession(request, authConfig);
		const email = session?.user?.email;
		const authenticated =
			!!email && envModule.default.server.AUTH_ADMIN_EMAILS.includes(email);
		if (authenticated) throw redirect({ to: "/projects" });
	},
	component: LoginPage,
});

function LoginPage() {
	const { data, status } = useSession();
	if (status === "loading") return null;
	if (data) return <Navigate to="/projects" replace />;

	return (
		<div className="min-h-screen flex items-center justify-center">
			<SignInButton />
		</div>
	);
}

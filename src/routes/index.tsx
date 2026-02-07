import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { useSession } from "@/providers/SessionProvider";

export const Route = createFileRoute("/")({
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
		throw redirect({ to: authenticated ? "/projects" : "/login" });
	},
	component: IndexRedirect,
});

function IndexRedirect() {
	const { data, status } = useSession();
	if (status === "loading") return null;
	return <Navigate to={data ? "/projects" : "/login"} replace />;
}

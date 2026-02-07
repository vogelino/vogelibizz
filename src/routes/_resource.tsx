import {
	createFileRoute,
	Navigate,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useSession } from "@/providers/SessionProvider";

export const Route = createFileRoute("/_resource")({
	beforeLoad: async () => {
		if (typeof window !== "undefined") return;
		const [{ getStartContext }, { getSession }, { authConfig }, envModule] =
			await Promise.all([
				import("@tanstack/start-storage-context"),
				import("start-authjs"),
				import("@/utils/auth"),
				import("@/env"),
			]);
		const request = getStartContext({ throwIfNotFound: false })?.request;
		if (!request) return;
		const session = await getSession(request, authConfig);
		const email = session?.user?.email;
		const authenticated =
			!!email && envModule.default.server.AUTH_ADMIN_EMAILS.includes(email);
		if (!authenticated) throw redirect({ to: "/login" });
	},
	component: ResourceLayout,
});

function ResourceLayout() {
	const { data, status } = useSession();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	if (hydrated && status !== "loading" && !data) {
		return <Navigate to="/login" replace />;
	}
	return (
		<PageLayout>
			<Outlet />
		</PageLayout>
	);
}

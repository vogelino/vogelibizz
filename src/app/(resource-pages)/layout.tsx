import { PageLayout } from "@/components/PageLayout";
import { authProviderServer } from "@/providers/auth-provider";
import { redirect } from "next/navigation";
import type React from "react";
import type { ReactNode } from "react";

export default async function Layout({
	children,
	modal,
}: React.PropsWithChildren<{
	modal: ReactNode;
}>) {
	const data = await getData();

	if (!data.authenticated) {
		return redirect(data?.redirectTo || "/login");
	}

	return <PageLayout modal={modal}>{children}</PageLayout>;
}

async function getData() {
	const { authenticated, redirectTo } = await authProviderServer.check();

	return {
		authenticated,
		redirectTo,
	};
}

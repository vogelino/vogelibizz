import type React from "react";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/PageLayout";

export default async function Layout({
	children,
	modal,
}: React.PropsWithChildren<{
	modal: ReactNode;
}>) {
	return <PageLayout modal={modal}>{children}</PageLayout>;
}

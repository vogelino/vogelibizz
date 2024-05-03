import { DevtoolsProvider } from "@/providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import type { Metadata } from "next";
import type React from "react";
import { Suspense } from "react";

import Providers from "@/providers";
import { authProvider } from "@/providers/auth-provider";
import { dataProvider } from "@/providers/data-provider";
import "@/styles/global.css";
import { cn } from "@/utility/classNames";
import { fungis, lobular } from "@/utility/fonts";
import { ViewTransitions } from "next-view-transitions";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
	title: "Vogelibizz",
	description: "Daily business by vogelino",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ViewTransitions>
			<html
				lang="en"
				className={cn(lobular.variable, fungis.variable, "font-sans")}
				suppressHydrationWarning
			>
				<head />
				<body>
					<NextTopLoader
						color="var(--fg)"
						height={1}
						shadow={""}
						showSpinner={false}
						easing="ease-in-out"
						speed={400}
					/>
					<Suspense>
						<RefineKbarProvider>
							<DevtoolsProvider>
								<Refine
									routerProvider={routerProvider}
									authProvider={authProvider}
									dataProvider={dataProvider}
									resources={[
										{
											name: "projects",
											list: "/projects",
											create: "/projects/create",
											edit: "/projects/edit/:id",
											show: "/projects/show/:id",
											meta: {
												canDelete: true,
											},
										},
										{
											name: "clients",
											list: "/clients",
											create: "/clients/create",
											edit: "/clients/edit/:id",
											show: "/clients/show/:id",
											meta: {
												canDelete: true,
											},
										},
										{
											name: "expenses",
											list: "/expenses",
											create: "/expenses/create",
											edit: "/expenses/edit/:id",
											show: "/expenses/show/:id",
											meta: {
												canDelete: true,
											},
										},
									]}
									options={{
										syncWithLocation: true,
										warnWhenUnsavedChanges: true,
										useNewQueryKeys: true,
										projectId: "KAIuDr-qfjUWD-4P0y94",
									}}
								>
									<Providers>{children}</Providers>
									<RefineKbar />
								</Refine>
							</DevtoolsProvider>
						</RefineKbarProvider>
					</Suspense>
				</body>
			</html>
		</ViewTransitions>
	);
}

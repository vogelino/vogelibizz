import type { Metadata } from "next";
import type React from "react";

import Providers from "@/providers";
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
					<Providers>{children}</Providers>
				</body>
			</html>
		</ViewTransitions>
	);
}

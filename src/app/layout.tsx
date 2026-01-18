import type { Metadata } from "next";
import type React from "react";

import Providers from "@/providers";
import "@/styles/global.css";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { cn } from "@/utility/classNames";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

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
		<html
			lang="en"
			className={cn(inter.variable, "font-sans")}
			suppressHydrationWarning
		>
			<head />
			<body>
				<NextTopLoader
					color="hsl(var(--primary))"
					height={1}
					shadow={""}
					showSpinner={false}
					easing="ease-in-out"
					speed={400}
				/>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}

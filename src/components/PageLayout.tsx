"use client";
import { useLocation } from "@tanstack/react-router";
import type { PropsWithChildren, ReactNode } from "react";
import Footer from "@/components/Footer";
import { Menu } from "@/components/menu";
import type { SettingsType } from "@/db/schema";
import { SearchProvider } from "@/features/search";

export const PageLayout: React.FC<
	PropsWithChildren<{
		modal?: ReactNode;
		settings?: SettingsType;
	}>
> = ({ modal = null, children }) => {
	const pathname = useLocation().pathname;
	return (
		<SearchProvider>
			<Menu currentPage={pathname.replace(/^\//, "")} />
			{children}
			<Footer />
			{modal}
		</SearchProvider>
	);
};

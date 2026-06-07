"use client";
import { useLocation } from "@tanstack/react-router";
import type { PropsWithChildren, ReactNode } from "react";
import Footer from "@/components/Footer";
import { Menu } from "@/components/menu";
import type { SettingsType } from "@/db/schema";

export const PageLayout: React.FC<
	PropsWithChildren<{
		modal?: ReactNode;
		settings?: SettingsType;
	}>
> = ({ modal = null, settings, children }) => {
	const pathname = useLocation().pathname;
	return (
		<>
			<Menu
				currentPage={pathname.replace(/^\//, "")}
				initialSettings={settings}
			/>
			{children}
			<Footer />
			{modal}
		</>
	);
};

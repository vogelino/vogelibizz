"use client";
import { usePathname } from "next/navigation";
import type { PropsWithChildren, ReactNode } from "react";
import Footer from "@/components/Footer";
import { Menu } from "@/components/menu";

export const PageLayout: React.FC<
	PropsWithChildren<{
		modal?: ReactNode;
	}>
> = ({ modal = null, children }) => {
	const pathname = usePathname();
	return (
		<>
			<div className="layout pt-25.25">
				<Menu currentPage={pathname.replace(/^\//, "")} />
				<div className="content min-h-[calc(100vh-101px-83px)]">
					<div>{children}</div>
				</div>
				<Footer />
			</div>
			{modal}
		</>
	);
};

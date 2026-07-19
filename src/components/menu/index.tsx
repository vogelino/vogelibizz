"use client";

import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import BizzLogo from "@/components/BizzLogo";
import { cn } from "@/utility/classNames";
import { MenuAuxiliaryItems } from "./MenuAuxiliaryItems";
import { MenuDesktopNavigation } from "./MenuDesktopNavigation";

type MenuProps = {
	withBg?: boolean;
	currentPage: string;
};

export const Menu = ({ withBg = true }: MenuProps) => {
	const [mobileOpen, setMobileOpen] = useState(false);

	const withBgClasses = "bg-background border-border";
	const withoutBgClasses = "border-b-transparent";
	return (
		<header
			className={cn(
				!withBg && `logo-visible`,
				`left-0 sticky top-0 w-screen z-40`,
				`text-foreground px-6 md:px-10`,
				`border-b`,
				`flex justify-between items-center py-2`,
				`scrolled-top h-auto`,
				`transition motion-reduce:transition-none`,
				withBg ? withBgClasses : withoutBgClasses,
			)}
		>
			<Link
				to="/projects"
				className={cn(
					"group",
					"px-4 -ml-4 py-2",
					"focus:outline-none focus:ring-2 focus:ring-ring",
				)}
			>
				<BizzLogo />
			</Link>
			<button
				type="button"
				aria-label={
					mobileOpen ? "Close navigation menu" : "Open navigation menu"
				}
				id="burger-menu"
				aria-controls="menu"
				aria-expanded={mobileOpen}
				onClick={() => setMobileOpen((o) => !o)}
				className="md:hidden p-2 -mr-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
			>
				{mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
			</button>
			<div className="flex items-center gap-4 md:gap-6">
				<MenuDesktopNavigation onLinkClick={() => setMobileOpen(false)} />
				<MenuAuxiliaryItems />
			</div>
		</header>
	);
};

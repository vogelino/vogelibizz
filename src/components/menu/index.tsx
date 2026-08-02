"use client";

import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import BizzLogo from "@/components/BizzLogo";
import { SearchTrigger } from "@/features/search";
import { cn } from "@/utility/classNames";
import { MenuAuxiliaryItems } from "./MenuAuxiliaryItems";
import { MenuDesktopNavigation } from "./MenuDesktopNavigation";
import { MenuMobileNavigation } from "./MenuMobileNavigation";

type MenuProps = {
	withBg?: boolean;
	currentPage: string;
};

export const Menu = ({ withBg = true, currentPage }: MenuProps) => {
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!mobileOpen) return;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMobileOpen(false);
		};
		document.addEventListener("keydown", closeOnEscape);
		return () => document.removeEventListener("keydown", closeOnEscape);
	}, [mobileOpen]);

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
			<div className="flex items-center gap-2 md:hidden">
				<SearchTrigger onOpen={() => setMobileOpen(false)} />
				<button
					type="button"
					aria-label={
						mobileOpen ? "Close navigation menu" : "Open navigation menu"
					}
					id="burger-menu"
					aria-controls="mobile-menu"
					aria-expanded={mobileOpen}
					onClick={() => setMobileOpen((o) => !o)}
					className="p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-ring"
				>
					{mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
				</button>
			</div>
			<div className="hidden items-center gap-4 md:flex md:gap-6">
				<MenuDesktopNavigation
					currentPage={currentPage}
					onLinkClick={() => setMobileOpen(false)}
				/>
				<SearchTrigger />
				<MenuAuxiliaryItems />
			</div>
			{mobileOpen ? (
				<div
					id="mobile-menu"
					className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-border bg-background px-6 pb-6 shadow-lg md:hidden"
				>
					<MenuMobileNavigation
						currentPage={currentPage}
						onLinkClick={() => setMobileOpen(false)}
					/>
					<div className="pt-4">
						<MenuAuxiliaryItems />
					</div>
				</div>
			) : null}
		</header>
	);
};

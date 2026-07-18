"use client";

import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon, X } from "lucide-react";
import { Fragment, useState } from "react";
import BizzLogo from "@/components/BizzLogo";
import MenuUser from "@/components/MenuUser";
import ThemeToggle from "@/components/ThemeToggle";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type CurrencyIdType,
	currencyEnum,
	type SettingsType,
} from "@/db/schema";
import { cn } from "@/utility/classNames";
import useSettings from "@/utility/data/useSettings";
import useSettingsUpdate from "@/utility/data/useSettingsUpdate";
import { ExpensesMenuItem } from "./ExpensesMenuItem";
import HeaderMenuLink from "./HeaderMenuLink";

type MenuRoute = "/projects" | "/clients" | "/expenses" | "/invoices";

type MenuLinkType = {
	key: string;
	label: string;
	route: MenuRoute;
};

export const Menu = ({
	withBg = true,
	currentPage = "",
	initialSettings,
}: {
	withBg?: boolean;
	currentPage: string;
	initialSettings?: SettingsType;
}) => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const settingsQuery = useSettings(initialSettings);
	const settingsUpdate = useSettingsUpdate();
	const targetCurrency = settingsQuery.data?.targetCurrency ?? "CLP";
	const currencyOptions = currencyEnum.enumValues.map((currency) => ({
		value: currency,
		label: currency,
	}));
	const menuItems: MenuLinkType[] = [
		{
			key: "projects",
			label: "Projects",
			route: "/projects",
		},
		{
			key: "clients",
			label: "Clients",
			route: "/clients",
		},
		{
			key: "invoices",
			label: "Invoices",
			route: "/invoices",
		},
	];

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
			<nav
				id="menu"
				aria-label="Main navigation"
				className={cn(
					`fixed top-16 left-0 w-screen h-[calc(100svh-69px)] bg-background md:bg-transparent`,
					`md:opacity-100 md:static md:pointer-events-auto`,
					`md:w-auto md:h-auto md:bg-none transition-opacity`,
					`motion-reduce:transition-none flex gap-6`,
					`max-md:grid max-md:grid-rows-[1fr_auto]`,
					mobileOpen
						? `opacity-100 pointer-events-auto`
						: `opacity-0 pointer-events-none`,
				)}
			>
				<ul
					className={cn(`flex flex-col md:flex-row md:gap-4 items-center grow`)}
					aria-label="Main menu items"
				>
					{menuItems.map((item) => {
						if (item.key === "invoices") {
							return (
								<Fragment key={item.key}>
									<ExpensesMenuItem
										currentPage={currentPage}
										onNavigate={() => setMobileOpen(false)}
									/>
									<HeaderMenuLink
										to={item.route}
										title={item.label ?? "-"}
										active={currentPage.split("/")[0] === item.key}
										onClick={() => setMobileOpen(false)}
									/>
								</Fragment>
							);
						}

						return (
							<HeaderMenuLink
								key={item.key}
								to={item.route}
								title={item.label ?? "-"}
								active={currentPage.split("/")[0] === item.key}
								onClick={() => setMobileOpen(false)}
							/>
						);
					})}
				</ul>
				<ul
					className={cn(
						`flex md:gap-4 items-center grow-0 h-fit`,
						`pl-6 border-l border-border w-full`,
						`max-md:grid max-md:grid-cols-[1fr_auto_auto] max-md:gap-2`,
					)}
					aria-label="Secondary menu items"
				>
					<li
						aria-label="Secondary menu: Target currency"
						className={cn(
							`w-full md:w-auto py-5 md:p-0 text-muted-foreground`,
							`flex justify-between items-center pr-5 md:pr-0`,
						)}
					>
						{settingsQuery.isPending ? (
							<Skeleton className="h-9 w-24" />
						) : (
							<Combobox
								options={currencyOptions}
								value={targetCurrency}
								onChange={(value) =>
									settingsUpdate.mutate(value as CurrencyIdType)
								}
								className="min-w-24"
							/>
						)}
					</li>
					<li
						aria-label="Secondary menu link: Theme toggle"
						className={cn(
							`w-full md:w-auto py-5 md:p-0 text-muted-foreground`,
							`flex justify-between items-center pr-5 md:pr-0`,
						)}
					>
						<div className="text-foreground inline-flex items-center">
							<ThemeToggle />
						</div>
					</li>
					<li
						aria-label="Secondary menu link: User profile"
						className={cn(
							`w-full md:w-auto py-5 md:p-0 text-muted-foreground`,
							`flex justify-between items-center pr-5 md:pr-0`,
						)}
					>
						<MenuUser />
					</li>
				</ul>
			</nav>
		</header>
	);
};

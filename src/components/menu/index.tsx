"use client";

import { Link, type ToOptions } from "@tanstack/react-router";
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
import { Route as ClientsRoute } from "@/routes/_resource/clients";
import { Route as ExpensesRoute } from "@/routes/_resource/expenses";
import { Route as ProjectRoute } from "@/routes/_resource/projects";
import { cn } from "@/utility/classNames";
import useSettings from "@/utility/data/useSettings";
import useSettingsUpdate from "@/utility/data/useSettingsUpdate";
import HeaderMenuLink from "./HeaderMenuLink";

type MenuLinkType = {
	key: string;
	label: string;
	route: ToOptions["to"];
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
			route: ProjectRoute.fullPath,
		},
		{
			key: "clients",
			label: "Clients",
			route: ClientsRoute.fullPath,
		},
		{
			key: "expenses",
			label: "Expenses",
			route: ExpensesRoute.fullPath,
		},
	];

	const withBgClasses = "bg-background border-border";
	const withoutBgClasses = "border-b-transparent";
	return (
		<header
			className={cn(
				!withBg && `logo-visible`,
				`absolute top-0 left-1/2 -translate-x-1/2 w-screen z-40`,
				`text-foreground px-10`,
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
				aria-label="Hide the main navitation menu"
				id="burger-menu"
				aria-hidden="false"
				aria-expanded="false"
				className="md:hidden md:invisible"
			>
				<span />
			</button>
			<nav
				id="menu"
				aria-label="Main navigation"
				className={cn(
					`fixed top-25.25 left-0 w-screen h-[calc(100svh-69px)] bg-background md:bg-transparent`,
					`opacity-0 pointer-events-none md:opacity-100 md:static md:pointer-events-auto`,
					`md:w-auto md:h-auto md:bg-none transition-opacity`,
					`motion-reduce:transition-none flex gap-6 flex-wrap items-center`,
				)}
			>
				<ul
					className={cn(`flex flex-col md:flex-row md:gap-4 items-center`)}
					aria-label="Main menu items"
				>
					{menuItems.map((item) => (
						<HeaderMenuLink
							key={item.key}
							to={item.route ?? "/"}
							title={item.label ?? "-"}
							active={currentPage.split("/")[0] === item.key}
						/>
					))}
				</ul>
				<ul
					className={cn(
						`flex flex-col md:flex-row md:gap-4 items-center`,
						`pl-6 border-l border-border`,
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

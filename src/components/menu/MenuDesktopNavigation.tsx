import { Link, type LinkProps } from "@tanstack/react-router";
import { type ResourceIconKey, resourceIconMap } from "@/utility/resourceIcons";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export type MenuRoute = LinkProps["to"];

export type MenuLinkBase = {
	key: ResourceIconKey;
	label: string;
};

export type MenuLinkLeaf = MenuLinkBase & {
	route: MenuRoute;
};

export type MenuLinkParent = MenuLinkBase & {
	routes: MenuLinkLeaf[];
};

export type MenuLinkType = MenuLinkLeaf | MenuLinkParent;

export const menuItems: MenuLinkType[] = [
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
		key: "expenses",
		label: "Expenses",
		routes: [
			{
				key: "expense-dashboard",
				label: "Dashboard",
				route: "/expenses/dashboard",
			},
			{
				key: "expenses",
				label: "Recurring Expenses",
				route: "/expenses",
			},
			{
				key: "expense-history",
				label: "Expense History",
				route: "/expenses/history",
			},
		],
	},
	{
		key: "invoices",
		label: "Invoices",
		route: "/invoices",
	},
];

type MenuDesktopNavigationProps = {
	onLinkClick?: (item: MenuLinkType) => void;
};

export function MenuDesktopNavigation({
	onLinkClick,
}: MenuDesktopNavigationProps) {
	return (
		<NavigationMenu
			id="desktop-menu"
			aria-label="Main navigation"
			viewport={false}
		>
			<NavigationMenuList aria-label="Main menu items">
				{menuItems.map((item) => {
					const ItemIcon = resourceIconMap[item.key];
					if ("routes" in item) {
						return (
							<NavigationMenuItem key={item.key}>
								<NavigationMenuTrigger>
									<Link
										to={item.routes[0].route}
										title={item.label}
										onClick={() => onLinkClick?.(item)}
										className="inline-flex items-center gap-2 whitespace-nowrap"
									>
										<ItemIcon
											className="size-5 shrink-0 text-muted-foreground"
											aria-hidden="true"
										/>
										<span>{item.label}</span>
									</Link>
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="w-52">
										{item.routes.map((subItem) => {
											const SubItemIcon = resourceIconMap[subItem.key];
											return (
												<li key={subItem.key}>
													<NavigationMenuLink
														asChild
														className="flex-row items-center gap-2 whitespace-nowrap"
													>
														<Link to={subItem.route}>
															<SubItemIcon
																className="size-5 shrink-0 text-muted-foreground"
																aria-hidden="true"
															/>
															<span>{subItem.label}</span>
														</Link>
													</NavigationMenuLink>
												</li>
											);
										})}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						);
					}

					return (
						<NavigationMenuItem key={item.key}>
							<NavigationMenuLink
								asChild
								className={navigationMenuTriggerStyle}
							>
								<Link
									to={item.route}
									title={item.label ?? "-"}
									onClick={() => onLinkClick?.(item)}
								>
									<ItemIcon
										className="size-5 shrink-0 text-muted-foreground"
										aria-hidden="true"
									/>
									<span>{item.label}</span>
								</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					);
				})}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

import { Link, type LinkProps } from "@tanstack/react-router";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

type MenuRoute = LinkProps["to"];

type MenuLinkBase = {
	key: string;
	label: string;
};

type MenuLinkLeaf = MenuLinkBase & {
	route: MenuRoute;
};

type MenuLinkParent = MenuLinkBase & {
	routes: MenuLinkLeaf[];
};

type MenuLinkType = MenuLinkLeaf | MenuLinkParent;

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
		key: "expenses",
		label: "Expenses",
		routes: [
			{
				key: "recurring-expenses",
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
		<NavigationMenu id="menu" aria-label="Main navigation">
			<NavigationMenuList aria-label="Main menu items">
				{menuItems.map((item) => {
					if ("routes" in item) {
						return (
							<NavigationMenuItem key={item.key}>
								<NavigationMenuTrigger>
									<Link
										to={item.routes[0].route}
										title={item.label}
										onClick={() => onLinkClick?.(item)}
									>
										{item.label}
									</Link>
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="w-52">
										{item.routes.map((subItem) => (
											<li key={subItem.key}>
												<NavigationMenuLink asChild>
													<Link to={subItem.route}>{subItem.label}</Link>
												</NavigationMenuLink>
											</li>
										))}
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
									{item.label}
								</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					);
				})}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

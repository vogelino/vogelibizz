import { Link } from "@tanstack/react-router";
import { resourceIconMap } from "@/utility/resourceIcons";
import { isCurrentMenuRoute } from "./isCurrentMenuRoute";
import { type MenuLinkType, menuItems } from "./MenuDesktopNavigation";

type MenuMobileNavigationProps = {
	currentPage: string;
	onLinkClick?: (item: MenuLinkType) => void;
};

export function MenuMobileNavigation({
	currentPage,
	onLinkClick,
}: MenuMobileNavigationProps) {
	return (
		<nav aria-label="Mobile main navigation">
			<ul className="flex flex-col">
				{menuItems.map((item) => {
					const ItemIcon = resourceIconMap[item.key];
					if ("routes" in item) {
						return (
							<li key={item.key} className="border-b border-border py-2">
								<div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground">
									<ItemIcon className="size-5 shrink-0" aria-hidden="true" />
									<span>{item.label}</span>
								</div>
								<ul className="flex flex-col">
									{item.routes.map((subItem) => {
										const SubItemIcon = resourceIconMap[subItem.key];
										const active = isCurrentMenuRoute(
											currentPage,
											subItem.route,
										);
										return (
											<li key={subItem.key}>
												<Link
													to={subItem.route}
													aria-current={active ? "page" : undefined}
													onClick={() => onLinkClick?.(subItem)}
													className="flex items-center gap-3 px-8 py-3 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:font-semibold"
												>
													<SubItemIcon
														className="size-5 shrink-0 text-muted-foreground"
														aria-hidden="true"
													/>
													<span>{subItem.label}</span>
												</Link>
											</li>
										);
									})}
								</ul>
							</li>
						);
					}

					const active = isCurrentMenuRoute(currentPage, item.route);
					return (
						<li key={item.key} className="border-b border-border">
							<Link
								to={item.route}
								aria-current={active ? "page" : undefined}
								onClick={() => onLinkClick?.(item)}
								className="flex items-center gap-3 px-4 py-4 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:font-semibold"
							>
								<ItemIcon
									className="size-5 shrink-0 text-muted-foreground"
									aria-hidden="true"
								/>
								<span>{item.label}</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

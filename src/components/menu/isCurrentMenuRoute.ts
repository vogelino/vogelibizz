import type { MenuRoute } from "./MenuDesktopNavigation";

export function isCurrentMenuRoute(currentPage: string, route: MenuRoute) {
	const pathname = `/${currentPage}`;
	const routePath = String(route);

	if (routePath === "/expenses") return pathname === routePath;

	return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

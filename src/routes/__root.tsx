import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouter,
} from "@tanstack/react-router";
import type React from "react";
import Providers from "@/providers";
import type { RouterContext } from "@/router";
import appCss from "@/styles/global.css?url";
import { getThemeServerFn } from "@/utility/theme";

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Vogelibizz" },
			{ name: "description", content: "Daily business by vogelino" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	beforeLoad: async () => ({ theme: await getThemeServerFn() }),
	notFoundComponent: () => <div>404 Not Found</div>,
	component: RootComponent,
});

function RootComponent() {
	const router = useRouter();
	const { queryClient } = router.options.context as RouterContext;
	const { theme } = Route.useRouteContext();
	const htmlStyle = { "--font-inter": "Inter" } as React.CSSProperties;
	return (
		<html
			lang="en"
			className="font-sans"
			data-theme={theme === "auto" ? undefined : theme}
			style={htmlStyle}
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
			</head>
			<body>
				<Providers queryClient={queryClient}>
					<Outlet />
				</Providers>
				<Scripts />
			</body>
		</html>
	);
}

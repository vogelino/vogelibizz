import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type React from "react";
import Providers from "@/providers";
import appCss from "@/styles/global.css?url";

export const Route = createRootRoute({
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
	notFoundComponent: () => <div>404 Not Found</div>,
	component: RootComponent,
});

function RootComponent() {
	const htmlStyle = { "--font-inter": "Inter" } as React.CSSProperties;
	return (
		<html
			lang="en"
			className="font-sans"
			style={htmlStyle}
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
			</head>
			<body>
				<Providers>
					<Outlet />
				</Providers>
				<Scripts />
			</body>
		</html>
	);
}

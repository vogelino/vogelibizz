"use client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { useRef } from "react";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient();
	}
	// Browser: make a new query client if we don't already have one
	// This is very important so we don't re-make a new client if React
	// suspends during the initial render. This may not be needed if we
	// have a suspense boundary BELOW the creation of the query client
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

function Providers({ children }: { children: React.ReactNode }) {
	const queryClient = useRef(getQueryClient());

	return (
		<>
			<SessionProvider>
				<QueryClientProvider client={queryClient.current}>
					<ThemeProvider defaultTheme="system" enableSystem>
						<TooltipProvider>
							{children}
							<ReactQueryDevtools initialIsOpen={false} />
						</TooltipProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</SessionProvider>
			<Toaster />
		</>
	);
}

export default Providers;

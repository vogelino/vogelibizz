"use client";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { useRef } from "react";
import { Toaster } from "sonner";

function Providers({ children }: { children: React.ReactNode }) {
	const queryClient = useRef(
		new QueryClient({
			defaultOptions: {
				queries: {
					// Stale time one hour
					staleTime: 1000 * 60 * 60,
				},
			},
		}),
	);

	return (
		<>
			<QueryClientProvider client={queryClient.current}>
				<ThemeProvider defaultTheme="system" enableSystem>
					<TooltipProvider>
						<ReactQueryStreamedHydration>
							{children}
						</ReactQueryStreamedHydration>
						<ReactQueryDevtools initialIsOpen={false} />
					</TooltipProvider>
				</ThemeProvider>
			</QueryClientProvider>
			<Toaster />
		</>
	);
}

export default Providers;

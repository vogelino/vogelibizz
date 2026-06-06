"use client";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

function Providers({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	const queryClientRef = useRef(queryClient);

	return (
		<>
			<QueryClientProvider client={queryClientRef.current}>
				<SessionProvider>
					<ThemeProvider defaultTheme="system" enableSystem>
						<TooltipProvider>
							{children}
							<ReactQueryDevtools initialIsOpen={false} />
						</TooltipProvider>
					</ThemeProvider>
				</SessionProvider>
			</QueryClientProvider>
			<Toaster />
		</>
	);
}

export default Providers;

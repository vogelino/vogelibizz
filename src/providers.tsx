"use client";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/providers/SessionProvider";

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
					<TooltipProvider>
						{children}
						<ReactQueryDevtools initialIsOpen={false} />
					</TooltipProvider>
				</SessionProvider>
			</QueryClientProvider>
			<Toaster />
		</>
	);
}

export default Providers;

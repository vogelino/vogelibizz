import { QueryClient } from "@tanstack/react-query";

export default function createServerQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});
}

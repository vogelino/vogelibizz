import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/exchange-rates")({
	server: {
		handlers: {
			GET: async () => {
				const { getExchangeRatesRecord } = await import(
					"@/server/api/currencies/getExchangeRates"
				);
				return json(await getExchangeRatesRecord());
			},
		},
	},
});

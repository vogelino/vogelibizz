import {
	type CurrencyIdType,
	type CurrencyType,
	currencyEnum,
} from "@/db/schema";
import env from "@/env";
import { fetchOpenExchangeRates } from "@/utility/expenseFetchUtil";
import { randomToMax } from "@/utility/randomUti";

async function getSeedData(): Promise<CurrencyType[]> {
	if (env.server.POSTGRES_SEEDING) {
		return currencyEnum.enumValues.map((id) => ({
			id,
			usdRate: randomToMax(10),
			last_modified: new Date("2000-01-01").toISOString(),
			created_at: new Date("2000-01-01").toISOString(),
		}));
	}

	const exchangeRates = await fetchOpenExchangeRates();

	if (!exchangeRates?.rates || Object.keys(exchangeRates.rates).length === 0) {
		return currencyEnum.enumValues.map((id) => ({
			id,
			usdRate: randomToMax(10),
			last_modified: new Date("2000-01-01").toISOString(),
			created_at: new Date("2000-01-01").toISOString(),
		}));
	}

	return Object.entries(exchangeRates.rates)
		.filter(([id]) => currencyEnum.enumValues.includes(id as CurrencyIdType))
		.map(([id, usdRate]) => ({
			id: id as CurrencyIdType,
			usdRate: typeof usdRate === "number" ? usdRate : Number(usdRate),
			last_modified: new Date("2000-01-01").toISOString(),
			created_at: new Date("2000-01-01").toISOString(),
		}));
}

export default await getSeedData();

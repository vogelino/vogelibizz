import type { CurrencyIdType } from "@/db/schema";
import { getExchangeRates } from "@/utility/expenseFetchUtil";

export async function getExchangeRatesRecord(): Promise<
	Record<CurrencyIdType, number>
> {
	const ratesMap = await getExchangeRates();
	return Object.fromEntries(ratesMap) as Record<CurrencyIdType, number>;
}

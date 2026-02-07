import { formatISO, isToday, subMinutes } from "date-fns";
import { inArray, type SQL, sql } from "drizzle-orm";
import { z } from "zod";
import db from "@/db";
import {
	type CurrencyIdType,
	type CurrencyType,
	currencies,
	currencyEnum,
	type ExpenseType,
	type ExpenseWithMonthlyCLPPriceType,
	settings,
} from "@/db/schema";
import env from "@/env";

const OpenExchangeRatesJsonSchema = z.object({
	rates: z.record(z.string(), z.number()),
});
type OpenExchangeRatesReturnType = z.infer<typeof OpenExchangeRatesJsonSchema>;
export type RatesMapType = Map<CurrencyIdType, number>;

async function getExchangeRates(): Promise<RatesMapType> {
	console.log("Fetching exchange rates from DB");
	const dbCurrencies = await db.query.currencies.findMany();
	console.log(`Found ${dbCurrencies.length} currencies in DB`);
	const lastUpdated = dbCurrencies[0]?.last_modified;

	if (!lastUpdated || !isToday(lastUpdated)) {
		console.log("Updating exchange rates");
		const updatedRates = await fetchOpenExchangeRates();
		if (!updatedRates) return currencyToRatesMap(dbCurrencies);
		const updatedCurrencies = openExchangeRatesToCurrencies(updatedRates);
		void updateRates(updatedCurrencies);
		return currencyToRatesMap(updatedCurrencies);
	}

	return currencyToRatesMap(dbCurrencies);
}

export async function getExpensesWithMonthlyClpPrice(
	expenses: ExpenseType[],
): Promise<ExpenseWithMonthlyCLPPriceType[]> {
	const rates = await getExchangeRates();
	const targetCurrency = await getTargetCurrency();
	return expenses.map((expense) => ({
		...expense,
		clpMonthlyPrice:
			getValueInTargetCurrencyPerMonth({
				value: expense.originalPrice,
				rates: rates,
				billingRate: expense.rate,
				currency: expense.originalCurrency,
				targetCurrency,
			}) ?? expense.originalPrice,
	}));
}

export async function fetchOpenExchangeRates(): Promise<OpenExchangeRatesReturnType | null> {
	const API_ID = env.client.VITE_PUBLIC_OPENEXCHANGERATES_API_KEY;

	let rawJson: unknown;
	try {
		const res = await fetch(
			`https://openexchangerates.org/api/latest.json?app_id=${API_ID}`,
		);
		rawJson = await res.json();
	} catch (err) {
		console.log(`Failed to fetch OpenExchangeRates`, err);
	}
	return parseOpenExchangeRatesResponse(rawJson);
}

function getValueInTargetCurrencyPerMonth({
	value,
	currency,
	rates,
	billingRate,
	targetCurrency,
}: {
	value: number;
	currency: ExpenseType["originalCurrency"];
	rates: null | RatesMapType;
	billingRate: ExpenseType["rate"];
	targetCurrency: CurrencyIdType;
}) {
	if (!rates) return null;
	let monthlyPrice = value;
	if (currency !== targetCurrency) {
		const originRate = currency === "CLP" ? 1 : rates.get(currency) ?? 0;
		const targetRate = targetCurrency === "CLP" ? 1 : rates.get(targetCurrency) ?? 0;
		const clpValue = originRate ? value / originRate : 0;
		monthlyPrice = targetRate ? clpValue * targetRate : 0;
	}
	if (billingRate !== "Monthly") {
		switch (billingRate) {
			case "Yearly":
				monthlyPrice /= 12;
				break;
			case "Weekly":
				monthlyPrice *= 4;
				break;
			case "Daily":
				monthlyPrice = (monthlyPrice * 165) / 12;
				break;
			case "Bi-Monthly":
				monthlyPrice /= 2;
				break;
			case "Bi-Weekly":
				monthlyPrice *= 2;
				break;
			case "Bi-Yearly":
				monthlyPrice /= 24;
				break;
			case "Tri-Yearly":
				monthlyPrice /= 36;
				break;
			case "Hourly":
				monthlyPrice = (monthlyPrice * 24 * 365) / 12;
				break;
			case "Quarterly":
				monthlyPrice /= 4;
				break;
			case "Semester":
				monthlyPrice /= 6;
				break;
			case "One-time":
				monthlyPrice /= 12;
				break;
		}
	}
	return monthlyPrice;
}

async function getTargetCurrency(): Promise<CurrencyIdType> {
	const currentSettings = await db.query.settings.findFirst({
		columns: { targetCurrency: true },
	});
	return currentSettings?.targetCurrency ?? "CLP";
}

function currencyToRatesMap(
	currencies: Pick<CurrencyType, "id" | "usdRate">[],
): RatesMapType {
	return currencies.reduce((acc, currency) => {
		if (!isValidCurrencyId(currency.id)) {
			console.log(`Invalid currency id: ${currency.id}. Skipping.`);
			return acc;
		}
		acc.set(currency.id, currency.usdRate);
		return acc;
	}, new Map<CurrencyIdType, number>());
}

function isValidCurrencyId(id: unknown): id is CurrencyIdType {
	return currencyEnum.enumValues.includes(id as CurrencyIdType);
}

function parseOpenExchangeRatesResponse(
	json: unknown,
): null | OpenExchangeRatesReturnType {
	try {
		return OpenExchangeRatesJsonSchema.parse(json);
	} catch (err) {
		console.log("Error parsing OpenExchangeRates response");
		console.log("----------------------------------------");
		if (err instanceof z.ZodError) {
			for (const issue of err.issues) {
				const issuePath = String(issue.path[0]);
				console.log(`- ${issuePath}: ${issue.message}`);
			}
		} else {
			console.log(err);
		}
		console.log(`----------------------------------------`);
		return null;
	}
}

function openExchangeRatesToCurrencies(
	openExchangeResult: OpenExchangeRatesReturnType,
): Pick<CurrencyType, "id" | "usdRate">[] {
	return Object.entries(openExchangeResult.rates)
		.filter(([k]) => {
			const isPartOfEnum = isValidCurrencyId(k);
			if (!isPartOfEnum) {
				console.log(
					`Currency ${k} ignored because it is not part of the currency enum`,
				);
			}
			return isPartOfEnum;
		})
		.map(
			([k, v]) =>
				({
					id: k as CurrencyIdType,
					usdRate: v / openExchangeResult.rates.CLP,
				}) satisfies Pick<CurrencyType, "id" | "usdRate">,
		);
}

async function updateRates(
	updatedCurrencies: Pick<CurrencyType, "id" | "usdRate">[],
) {
	if (updatedCurrencies.length === 0) return;

	const sqlChunks: SQL[] = [];
	sqlChunks.push(sql`(case`);
	for (const currency of updatedCurrencies) {
		sqlChunks.push(
			sql`when ${currencies.id} = ${currency.id} then ${currency.usdRate}::double precision`,
		);
	}
	sqlChunks.push(sql`end)`);
	const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

	const now = new Date();
	const utcNow = subMinutes(now, now.getTimezoneOffset());
	const utcIsoString = formatISO(utcNow);

	await db
		.update(currencies)
		.set({
			last_modified: utcIsoString,
			usdRate: finalSql,
		})
		.where(inArray(currencies.id, currencyEnum.enumValues));
}

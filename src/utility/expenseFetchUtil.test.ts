import { describe, expect, test } from "bun:test";
import type { CurrencyIdType } from "@/db/schema";
import {
	getValueInTargetCurrencyPerMonth,
	type RatesMapType,
} from "./expenseFetchUtil";

const rates: RatesMapType = new Map<CurrencyIdType, number>([
	["CHF", 0.001],
	["EUR", 0.0009],
]);

describe("monthly target-currency conversion", () => {
	test("normalizes configured billing cycles and CHF history into one currency", () => {
		expect(
			getValueInTargetCurrencyPerMonth({
				value: 1_200,
				currency: "CHF",
				billingRate: "Yearly",
				rates,
				targetCurrency: "CHF",
			}),
		).toBe(100);
		expect(
			getValueInTargetCurrencyPerMonth({
				value: 75,
				currency: "CHF",
				billingRate: "Monthly",
				rates,
				targetCurrency: "CHF",
			}),
		).toBe(75);
		expect(
			getValueInTargetCurrencyPerMonth({
				value: 75,
				currency: "CHF",
				billingRate: "Monthly",
				rates,
				targetCurrency: "CLP",
			}),
		).toBe(75_000);
	});
});

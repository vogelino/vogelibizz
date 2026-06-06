import { relations } from "drizzle-orm";
import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { getNowInUTC } from "@/utility/timeUtil";
import { projects } from "./projectsDbSchema";

const currencyEnumValues = [
	"CLF",
	"CLP",
	"EUR",
	"CHF",
	"USD",
	"JPY",
	"GBP",
	"CNY",
	"AUD",
	"CAD",
	"HKD",
	"SGD",
	"SEK",
	"KRW",
	"NOK",
	"NZD",
	"INR",
	"MXN",
	"TWD",
	"ZAR",
	"BRL",
	"DKK",
	"PLN",
	"THB",
	"ILS",
	"IDR",
	"CZK",
	"AED",
	"TRY",
	"HUF",
	"SAR",
	"PHP",
	"MYR",
	"COP",
	"RUB",
	"RON",
	"PEN",
	"BHD",
	"BGN",
	"ARS",
] as const;

export const currencyEnum = {
	enumValues: currencyEnumValues,
};

export const currencies = sqliteTable("currencies", {
	id: text("original_currency", { enum: currencyEnumValues })
		.unique()
		.primaryKey(),
	created_at: text("created_at")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	last_modified: text("last_modified")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	usdRate: real("usdRate").notNull().default(0.0),
});

export type CurrencyType = typeof currencies.$inferSelect;
export type CurrencyIdType = CurrencyType["id"];
export type CurrencyInsertType = typeof currencies.$inferInsert;

export const exchangeRateSelectSchema = createSelectSchema(currencies);
export const exchangeRateInsertSchema = createInsertSchema(currencies);
export const exchangeRateEditSchema = exchangeRateSelectSchema
	.omit({
		created_at: true,
		last_modified: true,
	})
	.merge(
		z.object({
			last_modified: z
				.string()
				.optional()
				.default(() => getNowInUTC()),
		}),
	);
export type ExchangeRateEditType = z.infer<typeof exchangeRateEditSchema>;

export const currenciesRelations = relations(currencies, ({ many }) => ({
	expenses: many(projects, { relationName: "currency" }),
}));

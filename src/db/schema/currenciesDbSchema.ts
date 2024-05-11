import { relations } from "drizzle-orm";
import {
  doublePrecision,
  pgEnum,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projects } from "./projectsDbSchema";

export const currencyEnum = pgEnum("currency", [
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
]);

export const currencies = pgTable("currencies", {
  id: currencyEnum("original_currency").unique().primaryKey(),
  created_at: timestamp("created_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  last_modified: timestamp("last_modified", { mode: "string" })
    .defaultNow()
    .notNull(),
  usdRate: doublePrecision("usdRate").notNull().default(0.0),
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
        .default(() => new Date().toISOString()),
    })
  );
export type ExchangeRateEditType = z.infer<typeof exchangeRateEditSchema>;

export const currenciesRelations = relations(currencies, ({ many }) => ({
  expenses: many(projects),
}));

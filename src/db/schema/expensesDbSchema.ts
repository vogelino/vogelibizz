import {
  doublePrecision,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const expenseCategoryEnum = pgEnum("expense_category", [
  "Essentials",
  "Home",
  "Domain",
  "Health & Wellbeing",
  "Entertainment",
  "Charity",
  "Present",
  "Services",
  "Hardware",
  "Software",
  "Hobby",
  "Savings",
  "Transport",
  "Travel",
  "Administrative",
]);

export const expenseTypeEnum = pgEnum("expense_type", [
  "Personal",
  "Freelance",
]);

export const expenseRateEnum = pgEnum("expense_rate", [
  "Monthly",
  "Daily",
  "Hourly",
  "Weekly",
  "Yearly",
  "Quarterly",
  "Semester",
  "Bi-Weekly",
  "Bi-Monthly",
  "Bi-Yearly",
  "Tri-Yearly",
  "One-time",
]);

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

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  last_modified: timestamp("last_modified", { mode: "string" })
    .defaultNow()
    .notNull(),
  name: text("name").notNull().unique(),
  category: expenseCategoryEnum("category").notNull().default("Software"),
  type: expenseTypeEnum("type").notNull().default("Personal"),
  rate: expenseRateEnum("rate").notNull().default("Monthly"),
  price: doublePrecision("price").notNull().default(0.0),
  original_currency: currencyEnum("original_currency").notNull().default("CLP"),
});

export type ExpenseType = typeof expenses.$inferSelect;
export type ExpenseInsertType = typeof expenses.$inferInsert;

export const expenseSelectSchema = createSelectSchema(expenses);
export const expenseInsertSchema = createInsertSchema(expenses);

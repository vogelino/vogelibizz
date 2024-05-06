import type db from "@/db";
import { currencies as schema } from "../schema";
import currenciesSeedData from "./data/currenciesSeedData";

export async function seedCurrencies(db: db) {
	await db.insert(schema).values(currenciesSeedData);
}

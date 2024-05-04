import type db from "@/db";
import { quotes as schema } from "../schema";
import quotesSeedData from "./data/quotesSeedData";

export async function seedQuotes(db: db) {
	await db.insert(schema).values(quotesSeedData);
}

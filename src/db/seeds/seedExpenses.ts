import type db from "@/db";
import { expenses as schema } from "../schema";
import expensesSeedData from "./data/expensesSeedData";

export async function seedExpenses(db: db) {
	await db.insert(schema).values(expensesSeedData);
}

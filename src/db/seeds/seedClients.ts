import type db from "@/db";
import { clients as schema } from "../schema";
import clientsSeedData from "./data/clientsSeedData";

export async function seedClients(db: db) {
	await db.insert(schema).values(clientsSeedData);
}

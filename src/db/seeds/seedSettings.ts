import type { InferInsertModel } from "drizzle-orm";
import type db from "@/db";
import { settings as schema } from "../schema";
import settingsSeedData from "./data/settingsSeedData";

export async function seedSettings(db: db) {
	await db
		.insert(schema)
		.values(settingsSeedData as InferInsertModel<typeof schema>[]);
}

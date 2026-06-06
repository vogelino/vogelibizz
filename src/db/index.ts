import { getStartContext } from "@tanstack/start-storage-context";
import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@/db/d1Types";
import * as schema from "@/db/schema";

function resolveD1Database(): D1Database {
	const context = getStartContext({ throwIfNotFound: false });
	const d1 =
		(context?.contextAfterGlobalMiddlewares as { env?: { DB?: D1Database } })
			?.env?.DB ??
		(globalThis as { __START_ENV__?: { DB?: D1Database } }).__START_ENV__?.DB ??
		(globalThis as { DB?: D1Database }).DB;
	if (!d1) {
		throw new Error(
			"D1 database binding not found. Ensure env.DB is passed to the Start request context.",
		);
	}
	return d1;
}

let cachedDb: ReturnType<typeof drizzle> | null = null;
let cachedClient: D1Database | null = null;

export function getDb() {
	const client = resolveD1Database();
	if (cachedDb && cachedClient === client) {
		return cachedDb;
	}
	cachedClient = client;
	cachedDb = drizzle(client, {
		schema,
		logger: false,
	});
	return cachedDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop) {
		return (getDb() as Record<PropertyKey, unknown>)[prop];
	},
});

export type db = typeof db;

export default db;

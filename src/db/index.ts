import { getStartContext } from "@tanstack/start-storage-context";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
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

type SchemaDb = DrizzleD1Database<typeof schema> & { $client: D1Database };

let cachedDb: SchemaDb | null = null;
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

export function getDbProxyProperty(database: object, prop: PropertyKey) {
	const value = Reflect.get(database, prop, database);
	return typeof value === "function" ? value.bind(database) : value;
}

export const db = new Proxy({} as SchemaDb, {
	get(_target, prop) {
		return getDbProxyProperty(getDb(), prop);
	},
});

export type db = typeof db;

export default db;

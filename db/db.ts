import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

if (!host || !user || !password || !database) {
	throw new Error("Missing required environment variables for drizzle-kit");
}

const pgConnectionString = `postgres://${user}:${password}@${host}:5432/${database}`;

export const connection = postgres(pgConnectionString, { max: 1 });
export const db = drizzle(connection, { schema });

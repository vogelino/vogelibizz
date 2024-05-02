import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connection, db } from "./db";

await migrate(db, { migrationsFolder: "./drizzle" });

await connection.end();

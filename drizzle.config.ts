import 'dotenv/config'
import type { Config } from 'drizzle-kit'

const host = process.env.DB_HOST
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME

if (!host || !user || !password || !database) {
	throw new Error('Missing required environment variables for drizzle-kit')
}

const config: Config = {
	schema: './db/schema.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: { host, user, password, database },
}

export default config

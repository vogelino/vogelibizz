import { ZodError, z } from "zod";

const stringBoolean = z.coerce
	.string()
	.transform((val) => {
		return val === "true";
	})
	.default("false");

const jwtRegex =
	/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/gm;

const PublicEnvSchema = z.object({
	NEXT_PUBLIC_BASE_URL: z.string().url(),
	NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY: z.string(),
});

const ServerEnvSchema = PublicEnvSchema.merge(
	z.object({
		// Node envs
		NODE_ENV: z.string().default("development"),

		// Next Auth
		AUTH_SECRET: z.string(),
		AUTH_GITHUB_ID: z.string(),
		AUTH_GITHUB_SECRET: z.string(),
		AUTH_ADMIN_EMAIL: z.string().email(),

		// Database envs
		POSTGRES_URL: z.string(),
		POSTGRES_USER: z.string(),
		POSTGRES_PASSWORD: z.string(),
		POSTGRES_HOST: z.string(),
		POSTGRES_DATABASE: z.string(),
		POSTGRES_MIGRATING: stringBoolean,
		POSTGRES_SEEDING: stringBoolean,
	}),
);

export type EnvSchema = z.infer<typeof ServerEnvSchema>;

function parseEnvSchema<T extends z.ZodSchema>(
	schema: T,
	env: Record<string, unknown>,
) {
	try {
		return schema.parse(env);
	} catch (error) {
		if (error instanceof ZodError) {
			let message = "Missing required values in .env:\n";
			// biome-ignore lint/complexity/noForEach: <explanation>
			error.issues.forEach((issue) => {
				console.log(`- ${issue.path[0]}: ${issue.message}`);
				message += `- ${issue.path[0]}\n`;
			});
			const e = new Error(message);
			e.stack = "";
			throw e;
		}
		console.error(error);
	}
}
export default {
	get server(): z.infer<typeof ServerEnvSchema> {
		// On the server process.env is fully available even
		// if not requesting every single key explicitly
		return parseEnvSchema(ServerEnvSchema, process.env);
	},
	get client(): z.infer<typeof PublicEnvSchema> {
		// On the client the env vars won't be included in process.env
		// if not accessed explicitly
		return parseEnvSchema(PublicEnvSchema, {
			NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
			NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY:
				process.env.NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY,
		});
	},
};

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
		POSTGRES_URL_NON_POOLING: z.string(),
		POSTGRES_URL_NO_SSL: z.string(),
		POSTGRES_PRISMA_URL: z.string(),
	}),
);

export type EnvSchema = z.infer<typeof ServerEnvSchema>;

function parseEnvSchema<T extends z.ZodSchema>(schema: T) {
	try {
		return schema.parse(process.env);
	} catch (error) {
		if (error instanceof ZodError) {
			let message = "Missing required values in .env:\n";
			console.log(error.issues);
			// biome-ignore lint/complexity/noForEach: <explanation>
			error.issues.forEach((issue) => {
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
		return parseEnvSchema(ServerEnvSchema);
	},
	get client(): z.infer<typeof PublicEnvSchema> {
		return parseEnvSchema(PublicEnvSchema);
	},
};

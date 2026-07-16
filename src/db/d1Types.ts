export type D1PreparedStatement = {
	bind: (...values: unknown[]) => D1PreparedStatement;
};

export type D1Database = {
	prepare: (query: string) => D1PreparedStatement;
	batch: (statements: D1PreparedStatement[]) => Promise<unknown[]>;
};

export type D1Env = {
	DB: D1Database;
};

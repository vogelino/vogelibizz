export type D1Database = {
	prepare: (query: string) => unknown;
};

export type D1Env = {
	DB: D1Database;
};

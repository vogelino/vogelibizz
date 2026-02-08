export type StartStorageContext = {
	request: Request;
};

export async function runWithStartContext<T>(
	_context: StartStorageContext,
	fn: () => T | Promise<T>,
): Promise<T> {
	return await fn();
}

export function getStartContext<TThrow extends boolean = true>(opts?: {
	throwIfNotFound?: TThrow;
}): TThrow extends false ? StartStorageContext | undefined : StartStorageContext {
	if (opts?.throwIfNotFound !== false) {
		throw new Error(
			"No Start context found in client runtime. Use this only on the server.",
		);
	}
	return undefined as TThrow extends false
		? StartStorageContext | undefined
		: StartStorageContext;
}

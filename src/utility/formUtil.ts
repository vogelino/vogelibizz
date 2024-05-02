export type FormErrorsType<T extends Record<string, unknown>> = Record<
	keyof T,
	{
		message: string;
	}
>;

import type { SetStateAction } from "react";
import { useCallback, useMemo } from "react";

type SearchRecord = Record<string, unknown>;

function valuesEqual(left: unknown, right: unknown) {
	if (Array.isArray(left) && Array.isArray(right)) {
		return (
			left.length === right.length &&
			left.every((value, index) => value === right[index])
		);
	}
	return left === right;
}

/**
 * Adds a page state to an existing search object without dropping unrelated
 * parameters. Values matching their defaults are omitted to keep URLs concise.
 */
export function mergeUrlSearchState<
	TSearch extends object,
	TState extends object,
>(
	search: TSearch,
	state: TState,
	defaults: TState,
): Omit<TSearch, keyof TState> & Partial<TState> {
	const nextSearch = { ...search } as SearchRecord;
	for (const key of Object.keys(defaults) as Array<keyof TState>) {
		if (valuesEqual(state[key], defaults[key])) {
			delete nextSearch[String(key)];
		} else {
			nextSearch[String(key)] = state[key];
		}
	}
	return nextSearch as Omit<TSearch, keyof TState> & Partial<TState>;
}

/**
 * Creates controlled state backed by validated URL search parameters. The
 * caller supplies its router's navigation function, so this can be reused by
 * any page without coupling it to a particular route.
 */
export function useUrlSearchState<
	TSearch extends object,
	TState extends object,
>(
	search: TSearch,
	defaults: TState,
	navigate: (search: Omit<TSearch, keyof TState> & Partial<TState>) => unknown,
): readonly [TState, (update: SetStateAction<TState>) => void] {
	const state = useMemo(() => {
		const searchRecord = search as unknown as SearchRecord;
		return Object.fromEntries(
			(Object.keys(defaults) as Array<keyof TState>).map((key) => [
				key,
				searchRecord[String(key)] ?? defaults[key],
			]),
		) as TState;
	}, [defaults, search]);

	const setState = useCallback(
		(update: SetStateAction<TState>) => {
			const nextState =
				typeof update === "function"
					? (update as (previous: TState) => TState)(state)
					: update;
			void navigate(mergeUrlSearchState(search, nextState, defaults));
		},
		[defaults, navigate, search, state],
	);

	return [state, setState] as const;
}

import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const storageKey = "app-theme";

export const themeSchema = z.union([
	z.literal("light"),
	z.literal("dark"),
	z.literal("auto"),
]);
export type Theme = z.infer<typeof themeSchema>;

export const getThemeServerFn = createServerFn().handler(
	() => (getCookie(storageKey) ?? "auto") as Theme,
);

export const setThemeServerFn = createServerFn()
	.inputValidator(themeSchema)
	.handler(({ data }) => setCookie(storageKey, data));

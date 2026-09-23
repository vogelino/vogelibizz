import { z } from "zod";
import {
	currencyEnum,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";

export const expenseMatchRequestSchema = z.strictObject({
	name: z.string().trim().min(1),
	originalPrice: z.number().positive(),
	originalCurrency: z.enum(currencyEnum.enumValues),
	rate: z.enum(expenseRateEnum.enumValues),
});

export const expenseMatchSuggestionSchema = z.object({
	id: z.number().int().positive(),
	lastModified: z.string().min(1),
	bookedAt: z.iso.date(),
	description: z.string(),
	amount: z.number().positive(),
});

export const expenseMatchSuggestionsSchema = z.array(
	expenseMatchSuggestionSchema,
);

export const createExpenseWithMatchesSchema = expenseMatchRequestSchema.extend({
	category: z.enum(expenseCategoryEnum.enumValues),
	type: z.enum(expenseTypeEnum.enumValues),
	matches: z
		.array(
			z.strictObject({
				id: z.number().int().positive(),
				lastModified: z.string().min(1),
			}),
		)
		.min(1)
		.max(100)
		.refine(
			(matches) => new Set(matches.map(({ id }) => id)).size === matches.length,
			{
				message: "Choose each transaction only once.",
			},
		),
});

export const editExpenseWithMatchesSchema =
	createExpenseWithMatchesSchema.extend({
		id: z.number().int().positive(),
		lastModified: z.string().min(1),
	});

export type ExpenseMatchSuggestion = z.infer<
	typeof expenseMatchSuggestionSchema
>;

function normalizeName(value: string) {
	return value
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

export function isHighConfidenceExpenseMatch({
	name,
	expectedChfAmount,
	description,
	amount,
	foreignCurrency = false,
}: {
	name: string;
	expectedChfAmount: number;
	description: string;
	amount: number;
	foreignCurrency?: boolean;
}) {
	const normalizedName = normalizeName(name);
	const normalizedDescription = normalizeName(description);
	if (normalizedName.replaceAll(" ", "").length < 6) return false;
	if (!Number.isFinite(expectedChfAmount) || expectedChfAmount <= 0)
		return false;
	if (!Number.isFinite(amount) || amount <= 0) return false;
	if (
		!(
			normalizedDescription === normalizedName ||
			` ${normalizedDescription} `.includes(` ${normalizedName} `)
		)
	) {
		return false;
	}
	const tolerance = Math.max(
		0.5,
		expectedChfAmount * (foreignCurrency ? 0.03 : 0.01),
	);
	return Math.abs(amount - expectedChfAmount) <= tolerance;
}

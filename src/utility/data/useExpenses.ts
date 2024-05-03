import {
	currency,
	expenseCategory,
	expenseRate,
	expenseType,
} from "@/db/schema";
import { supabaseClient } from "@/utility/supabase-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { handleSupabaseResponse } from "./supabaseUtil";

export const ExpenseZodSchema = z.object({
	id: z.number(),
	created_at: z.string(),
	last_modified: z.string(),
	name: z.string(),
	category: z.enum(expenseCategory.enumValues).default("Software"),
	type: z.enum(expenseType.enumValues).default("Personal"),
	rate: z.enum(expenseRate.enumValues).default("Monthly"),
	price: z.number().default(0),
	original_currency: z.enum(currency.enumValues).default("CLP"),
});
export type ExpenseType = z.infer<typeof ExpenseZodSchema>;

function useExpenses() {
	const queryKey = ["expenses"];
	const { data, isPending, error } = useSuspenseQuery({
		queryKey,
		queryFn: getExpenses,
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getExpenses() {
	const response = await supabaseClient.from("expenses").select("*");
	return handleSupabaseResponse({
		response,
		schema: ExpenseZodSchema.array(),
	});
}

export default useExpenses;

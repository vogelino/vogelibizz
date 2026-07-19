import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import { expenseHistoryMonthKeySchema } from "@/utility/expenseHistoryContracts";
import {
	getExpenseHistoryMonth,
	getExpenseHistoryMonths,
	getExpenseHistoryTransaction,
	getExpenseOverviewSummary,
} from "./getExpenseHistory";

type ReadHttpDependencies = {
	authorize: (request: Request) => Promise<boolean>;
	getMonths: typeof getExpenseHistoryMonths;
	getMonth: typeof getExpenseHistoryMonth;
	getOverview: typeof getExpenseOverviewSummary;
	getTransaction: typeof getExpenseHistoryTransaction;
};

export function createExpenseHistoryReadHandlers(
	dependencies: ReadHttpDependencies = {
		authorize: (request) => isAuthenticatedAndAdmin(undefined, request),
		getMonths: getExpenseHistoryMonths,
		getMonth: getExpenseHistoryMonth,
		getOverview: getExpenseOverviewSummary,
		getTransaction: getExpenseHistoryTransaction,
	},
) {
	return {
		months: async (request: Request) => {
			if (!(await dependencies.authorize(request))) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}
			return json(await dependencies.getMonths());
		},
		overview: async (request: Request) => {
			if (!(await dependencies.authorize(request))) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}
			return json(await dependencies.getOverview());
		},
		month: async (request: Request, monthParam: string) => {
			if (!(await dependencies.authorize(request))) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}
			const parsedMonth =
				monthParam === "all"
					? null
					: expenseHistoryMonthKeySchema.safeParse(monthParam);
			if (parsedMonth !== null && !parsedMonth.success) {
				return json(
					{ error: "Month must use YYYY-MM format." },
					{ status: 400 },
				);
			}
			const url = new URL(request.url);
			const pagination = z
				.object({
					offset: z.coerce.number().int().nonnegative().default(0),
					limit: z.coerce.number().int().min(1).max(100).default(50),
				})
				.safeParse({
					offset: url.searchParams.get("offset") ?? undefined,
					limit: url.searchParams.get("limit") ?? undefined,
				});
			if (!pagination.success) {
				return json(
					{
						error:
							"Pagination requires a non-negative offset and a limit from 1 to 100.",
					},
					{ status: 400 },
				);
			}
			const result = await dependencies.getMonth(
				parsedMonth?.data ?? null,
				pagination.data,
			);
			if (!result) {
				return json(
					{
						error: parsedMonth
							? `No expense history exists for ${parsedMonth.data}.`
							: "No expense history exists.",
					},
					{ status: 404 },
				);
			}
			return json(result);
		},
		transaction: async (request: Request, idParam: string) => {
			if (!(await dependencies.authorize(request))) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}
			const id = z.coerce.number().int().positive().safeParse(idParam);
			if (!id.success) {
				return json({ error: "Invalid transaction id." }, { status: 400 });
			}
			const result = await dependencies.getTransaction(id.data);
			if (!result) {
				return json({ error: "Transaction not found." }, { status: 404 });
			}
			return json(result);
		},
	};
}

const readHandlers = createExpenseHistoryReadHandlers();
export const getExpenseHistoryMonthsHandler = readHandlers.months;
export const getExpenseHistoryMonthHandler = readHandlers.month;
export const getExpenseOverviewSummaryHandler = readHandlers.overview;
export const getExpenseHistoryTransactionHandler = readHandlers.transaction;

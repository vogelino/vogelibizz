import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import { expenseHistoryMonthKeySchema } from "@/utility/expenseHistoryContracts";
import {
	getExpenseHistoryMonth,
	getExpenseHistoryMonths,
	getExpenseOverviewSummary,
} from "./getExpenseHistory";

type ReadHttpDependencies = {
	authorize: (request: Request) => Promise<boolean>;
	getMonths: typeof getExpenseHistoryMonths;
	getMonth: typeof getExpenseHistoryMonth;
	getOverview: typeof getExpenseOverviewSummary;
};

export function createExpenseHistoryReadHandlers(
	dependencies: ReadHttpDependencies = {
		authorize: (request) => isAuthenticatedAndAdmin(undefined, request),
		getMonths: getExpenseHistoryMonths,
		getMonth: getExpenseHistoryMonth,
		getOverview: getExpenseOverviewSummary,
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
			const parsedMonth = expenseHistoryMonthKeySchema.safeParse(monthParam);
			if (!parsedMonth.success) {
				return json(
					{ error: "Month must use YYYY-MM format." },
					{ status: 400 },
				);
			}
			const result = await dependencies.getMonth(parsedMonth.data);
			if (!result) {
				return json(
					{ error: `No expense history exists for ${parsedMonth.data}.` },
					{ status: 404 },
				);
			}
			return json(result);
		},
	};
}

const readHandlers = createExpenseHistoryReadHandlers();
export const getExpenseHistoryMonthsHandler = readHandlers.months;
export const getExpenseHistoryMonthHandler = readHandlers.month;
export const getExpenseOverviewSummaryHandler = readHandlers.overview;

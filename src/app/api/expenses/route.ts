import { auth } from "@/auth";
import db from "@/db";
import { expenseInsertSchema, expenses } from "@/db/schema";
import { getCreationRoute } from "@/utility/apiUtil";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getExpenses } from "./getExpenses";

export const dynamic = "force-dynamic";
export const GET = auth(async () => {
	console.log("GET /api/expenses");
	try {
		const json = await getExpenses();
		return NextResponse.json(json);
	} catch (error) {
		console.log(`Error retrieving expenses: ${error}`);
		return NextResponse.json(
			{ error: "Error retrieving expenses" },
			{ status: 500 },
		);
	}
});

export const POST = getCreationRoute(async (body) => {
	return NextResponse.json(await db.insert(expenses).values(body));
}, z.array(expenseInsertSchema));

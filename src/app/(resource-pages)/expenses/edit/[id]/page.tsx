import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { getExpense } from "@/app/api/expenses/[id]/getExpense";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import createServerQueryClient from "@/utility/data/serverQueryClient";
import { parseId } from "@/utility/resourceUtil";

export const dynamic = "force-dynamic";
export default async function ExpenseEditPageRoute({
	params,
}: {
	params: { id?: string };
}) {
	if (!params?.id) {
		return null;
	}

	const parsedId = parseId(params.id);
	if (!parsedId) {
		return null;
	}

	const expense = await getExpense(parsedId);
	const serverQueryClient = createServerQueryClient();
	serverQueryClient.setQueryData(["expenses", `${parsedId}`], expense);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<FormPageLayout
				id={parsedId}
				title={"Edit expense"}
				allLink="/expenses"
				footerButtons={
					<>
						<Button asChild variant="outline">
							<Link href={`/expenses`}>
								<span>{"Cancel"}</span>
							</Link>
						</Button>
						<Button type="submit" form={`expense-edit-form-${parsedId}`}>
							<SaveIcon />
							{"Save expense"}
						</Button>
					</>
				}
			>
				<ExpenseEdit id={parsedId} formId={`expense-edit-form-${parsedId}`} />
			</FormPageLayout>
		</HydrationBoundary>
	);
}

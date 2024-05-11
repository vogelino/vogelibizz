import { getExpense } from "@/app/api/expenses/[id]/getExpense";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId } from "@/utility/resourceUtil";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function ExpenseEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const parsedId = parseId(id);
	const expense = await getExpense(parsedId);
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

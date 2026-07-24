import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { expenseQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/expenses/create")({
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: ({ context, deps }) =>
		deps.duplicateId
			? context.queryClient.ensureQueryData(
					expenseQueryOptions(deps.duplicateId),
				)
			: undefined,
	component: ExpenseCreatePageRoute,
});

function ExpenseCreatePageRoute() {
	const childMatches = useChildMatches();
	const duplicate = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<FormPageLayout
			title="Create Expense"
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link
							to="/expenses"
							search={(previous) => ({
								...previous,
								duplicateId: undefined,
							})}
						>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form="expense-create-form">
						<SaveIcon />
						{"Create expense"}
					</Button>
				</>
			}
		>
			<ExpenseEdit
				formId="expense-create-form"
				initialData={
					duplicate
						? { ...duplicate, name: `copy ${duplicate.name}` }
						: undefined
				}
			/>
		</FormPageLayout>
	);
}

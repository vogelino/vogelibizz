import { createFileRoute } from "@tanstack/react-router";
import ExpensesPage from "@/app/(resource-pages)/expenses/(show)/ExpensesPage";

export const Route = createFileRoute("/_resource/expenses/")({
	component: ExpensesPage,
});

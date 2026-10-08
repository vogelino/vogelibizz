"use client";

import { ExpenseDashboardView } from "./components/expense-dashboard-view";
import { useExpenseDashboardPage } from "./useExpenseDashboardPage";

export default function ExpenseDashboardPage() {
  return <ExpenseDashboardView state={useExpenseDashboardPage()} />;
}

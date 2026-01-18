import type { ReactNode } from "react";
import ResourcePageLayout from "@/components/ResourcePageLayout";

function ExpensesLayout({ children }: { children: ReactNode }) {
	return (
		<ResourcePageLayout resource="expenses">{children}</ResourcePageLayout>
	);
}

export default ExpensesLayout;

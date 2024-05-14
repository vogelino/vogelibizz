import ResourcePageLayout from "@/components/ResourcePageLayout";
import type { ReactNode } from "react";

function ExpensesLayout({ children }: { children: ReactNode }) {
	return (
		<ResourcePageLayout resource="expenses">{children}</ResourcePageLayout>
	);
}

export default ExpensesLayout;

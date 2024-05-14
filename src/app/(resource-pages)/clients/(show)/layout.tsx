import ResourcePageLayout from "@/components/ResourcePageLayout";
import type { ReactNode } from "react";

function ClientsLayout({ children }: { children: ReactNode }) {
	return <ResourcePageLayout resource="clients">{children}</ResourcePageLayout>;
}

export default ClientsLayout;

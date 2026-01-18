import type { ReactNode } from "react";
import ResourcePageLayout from "@/components/ResourcePageLayout";

function ClientsLayout({ children }: { children: ReactNode }) {
	return <ResourcePageLayout resource="clients">{children}</ResourcePageLayout>;
}

export default ClientsLayout;

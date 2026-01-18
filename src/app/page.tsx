import { redirect } from "next/navigation";
import { isAuthenticatedAndAdmin } from "@/auth";
import env from "@/env";

export const dynamic = "force-dynamic";
export default async function IndexPage() {
	const authenticatedAndAdmin = await isAuthenticatedAndAdmin();
	if (authenticatedAndAdmin)
		return redirect(`${env.server.NEXT_PUBLIC_BASE_URL}/projects`);
	return redirect(`${env.server.NEXT_PUBLIC_BASE_URL}/login`);
}

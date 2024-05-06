import { isAuthenticatedAndAdmin } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function IndexPage() {
	const authenticatedAndAdmin = await isAuthenticatedAndAdmin();
	if (authenticatedAndAdmin) return redirect("/projects");
	return redirect("/login");
}

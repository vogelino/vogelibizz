import { isAuthenticatedAndAdmin } from "@/auth";
import { redirect } from "next/navigation";

export default async function IndexPage() {
	const authenticatedAndAdmin = await isAuthenticatedAndAdmin();
	if (authenticatedAndAdmin) return redirect("/projects");
	return redirect("/login");
}

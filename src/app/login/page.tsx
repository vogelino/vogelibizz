import { redirect } from "next/navigation";
import { isAuthenticatedAndAdmin } from "@/auth";
import { SignInButton } from "@/components/SignInButton";

export const dynamic = "force-dynamic";
export default async function Login() {
	const isAuthenticated = await isAuthenticatedAndAdmin();
	if (isAuthenticated) return redirect("/projects");

	return (
		<div className="min-h-screen flex items-center justify-center">
			<SignInButton />
		</div>
	);
}

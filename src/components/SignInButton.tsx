"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

export function SignInButton() {
	return (
		<Button
			onClick={() => signIn("github", { redirectTo: "/projects" })}
			className="flex gap-4 items-center"
		>
			<Github />
			Signin with GitHub
		</Button>
	);
}

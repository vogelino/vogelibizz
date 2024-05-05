"use client";

import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

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

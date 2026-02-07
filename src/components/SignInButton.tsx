"use client";

import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/providers/SessionProvider";

export function SignInButton() {
	return (
		<Button
			onClick={() => signIn({ redirectTo: "/projects", provider: "github" })}
			className="flex gap-4 items-center"
		>
			<Github />
			Signin with GitHub
		</Button>
	);
}

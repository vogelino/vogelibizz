"use client";
import { LogOut } from "lucide-react";
import { signOut } from "@/providers/SessionProvider";
import { cn } from "@/utility/classNames";

function LogoutButton() {
	return (
		<>
			<button
				type="button"
				onClick={() => signOut()}
				className={cn(
					"text-base font-normal w-10 sm:w-10 h-10",
					"flex items-center justify-center sm:p-0",
				)}
			>
				<LogOut />
			</button>
			<span className="text-base">Log out</span>
		</>
	);
}

export default LogoutButton;

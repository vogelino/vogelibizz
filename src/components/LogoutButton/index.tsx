"use client";
import HeaderMenuLink from "@/components/menu/HeaderMenuLink";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

function LogoutButton() {
	return (
		<HeaderMenuLink
			as="button"
			onClick={() => signOut()}
			title={<LogOut />}
			className="w-10 sm:w-10 h-10 flex items-center justify-center sm:p-0"
		/>
	);
}

export default LogoutButton;

"use client";
import HeaderMenuLink from "@/components/menu/HeaderMenuLink";
import { useLogout } from "@refinedev/core";
import { LogOut } from "lucide-react";

function LogoutButton() {
	const { mutate: logout } = useLogout();

	return (
		<HeaderMenuLink
			as="button"
			onClick={() => logout()}
			title={<LogOut />}
			className="w-10 sm:w-10 h-10 flex items-center justify-center sm:p-0"
		/>
	);
}

export default LogoutButton;

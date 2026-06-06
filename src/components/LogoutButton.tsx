"use client";
import { LogOut } from "lucide-react";

function LogoutButton() {
	return (
		<>
			<LogOut className="size-4" />
			<span className="text-base">Log out</span>
		</>
	);
}

export default LogoutButton;

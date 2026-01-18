"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utility/classNames";

export default function MenuUser() {
	const session = useSession();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"size-8 aspect-square rounded-full bg-grayUltraLight overflow-clip border-grayLight",
						"transition-opacity hover:opacity-75 border",
					)}
				>
					{session.data?.user?.image && (
						<Image
							src={session.data.user.image}
							width={32}
							height={32}
							alt={`Profile picture of ${session.data.user.name}`}
							className="animate-in fade-in"
						/>
					)}
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>
					<LogoutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

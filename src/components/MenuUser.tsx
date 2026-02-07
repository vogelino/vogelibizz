"use client";

import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/providers/SessionProvider";
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
						"size-8 aspect-square bg-muted overflow-clip border-border",
						"transition-opacity hover:opacity-75 border",
					)}
				>
					{session.data?.user?.image && (
						<img
							src={session.data.user.image}
							width={32}
							height={32}
							alt={`Profile of ${session.data.user.name}`}
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

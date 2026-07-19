import { cn } from "@/utility/classNames";
import MenuUser from "../MenuUser";
import ThemeToggle from "../ThemeToggle";

export function MenuAuxiliaryItems() {
	return (
		<ul
			className={cn(
				`flex md:gap-4 items-center grow-0 h-fit`,
				`pl-6 border-l border-border w-fit`,
				`max-md:grid max-md:grid-cols-[1fr_auto_auto] max-md:gap-2`,
			)}
			aria-label="Secondary menu items"
		>
			<li
				aria-label="Secondary menu link: Theme toggle"
				className={cn(
					`w-full md:w-auto py-5 md:p-0 text-muted-foreground`,
					`flex justify-between items-center pr-5 md:pr-0`,
				)}
			>
				<div className="text-foreground inline-flex items-center">
					<ThemeToggle />
				</div>
			</li>
			<li
				aria-label="Secondary menu link: User profile"
				className={cn(
					`w-full md:w-auto py-5 md:p-0 text-muted-foreground`,
					`flex justify-between items-center pr-5 md:pr-0`,
				)}
			>
				<MenuUser />
			</li>
		</ul>
	);
}

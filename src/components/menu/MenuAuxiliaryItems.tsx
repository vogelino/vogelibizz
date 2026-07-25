import { cn } from "@/utility/classNames";
import MenuUser from "../MenuUser";
import ThemeToggle from "../ThemeToggle";

export function MenuAuxiliaryItems({ className }: { className?: string }) {
	return (
		<ul
			className={cn(
				`flex gap-4 items-center grow-0 h-fit`,
				`pl-6 border-l border-border w-fit`,
				`max-md:w-full max-md:justify-between max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-4`,
				className,
			)}
			aria-label="Secondary menu items"
		>
			<li
				aria-label="Secondary menu link: Theme toggle"
				className={cn(
					`w-auto text-muted-foreground`,
					`flex justify-between items-center`,
				)}
			>
				<div className="text-foreground inline-flex items-center">
					<ThemeToggle />
				</div>
			</li>
			<li
				aria-label="Secondary menu link: User profile"
				className={cn(
					`w-auto text-muted-foreground`,
					`flex justify-between items-center`,
				)}
			>
				<MenuUser />
			</li>
		</ul>
	);
}

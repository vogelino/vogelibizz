import { useRouteContext, useRouter } from "@tanstack/react-router";
import {
	Check,
	Laptop,
	type LucideIcon,
	MoonIcon,
	SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utility/classNames";
import type { Theme } from "@/utility/theme";
import { setThemeServerFn } from "@/utility/theme";

type ThemeOptionType = {
	name: Theme;
	label: string;
	Icon: LucideIcon;
};
const themeOptions: ThemeOptionType[] = [
	{ name: "auto", label: "System", Icon: Laptop },
	{ name: "light", label: "Light", Icon: SunIcon },
	{ name: "dark", label: "Dark", Icon: MoonIcon },
];

export default function ThemeToggle() {
	const { theme } = useRouteContext({ from: "__root__" });
	const router = useRouter();

	async function handleSetTheme(next: Theme) {
		await setThemeServerFn({ data: next });
		if (document.startViewTransition) {
			document.startViewTransition(() => router.invalidate());
		} else {
			router.invalidate();
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					{themeOptions.map((option, idx) => (
						<option.Icon
							key={option.name}
							className={cn(
								idx !== 0 && "absolute",
								"rotate-90 scale-0 opacity-0 transition-all",
								option.name === theme && "rotate-0 scale-100 opacity-100",
							)}
						/>
					))}
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{themeOptions.map((option) => (
					<DropdownMenuItem
						key={option.name}
						onClick={() => handleSetTheme(option.name)}
					>
						<div className="grid gap-2 items-center grid-cols-[auto_80px_auto]">
							<option.Icon />
							<span>{option.label}</span>
							<Check
								className={cn(
									"opacity-0",
									option.name === theme && "opacity-50",
								)}
							/>
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

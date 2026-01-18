"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { cn } from "@/utility/classNames";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast: cn(
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground",
						"group-[.toaster]:border-border group-[.toaster]:border",
						"group-[.toaster]:shadow-none group-[.toaster]:rounded-none",
					),
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton: cn(
						"group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border",
						"group-[.toast]:hover:bg-muted group-[.toast]:border-border",
						"group-[.toast]:rounded-none",
					),
					icon: "group-[.toast]:text-foreground",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/utility/classNames";

function HeaderMenuLink({
	onClick,
	to,
	title,
	className,
	active,
	ariaLabel,
}: {
	onClick?: () => void;
	to?: string;
	title: ReactNode;
	ariaLabel?: string;
	className?: string;
	active?: boolean;
}) {
	return (
		<li className="inline-block w-full sm:w-auto">
			<Link
				to={to ?? "/"}
				aria-label={`Header menu link: ${ariaLabel || title} page`}
				className={cn(
					`uppercase sm:normal-case text-base font-normal`,
					`sm:border-none border-b border-border antialiased`,
					`px-3 sm:px-4 sm:py-1.5 transition-colors`,
					`inline-block w-screen sm:w-auto`,
					`focus-visible:ring-2 focus-visible:ring-ring outline-none`,
					!active && [`hover:bg-accent`],
					active && [`font-semibold bg-secondary sm:px-4 `],
					className,
				)}
				tabIndex={active ? -1 : 0}
				onClick={onClick}
			>
				{title}
			</Link>
		</li>
	);
}

export default HeaderMenuLink;

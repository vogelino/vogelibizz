import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/utility/classNames";

export type LinkPath = ComponentProps<typeof Link>["to"];

function HeaderMenuLink({
	onClick,
	to,
	title,
	className,
	active,
	ariaLabel,
}: {
	onClick?: () => void;
	to: LinkPath | "/invoices";
	title: ReactNode;
	ariaLabel?: string;
	className?: string;
	active?: boolean;
}) {
	const commonClassName = cn(
		`uppercase md:normal-case text-base font-normal`,
		`md:border-none border-b border-border antialiased`,
		`px-6 md:px-4 md:py-1.5 transition-colors`,
		`flex items-center`,
		`md:inline-block w-screen md:w-auto max-md:h-12`,
		`focus-visible:ring-2 focus-visible:ring-ring outline-none`,
		!active && `hover:bg-accent`,
		active && `font-semibold bg-secondary`,
		className,
	);
	const ariaLabelText = `Header menu link: ${ariaLabel || title} page`;

	return (
		<li className="inline-block w-full md:w-auto">
			{to === "/invoices" ? (
				<button
					type="button"
					aria-label={ariaLabelText}
					className={commonClassName}
					tabIndex={active ? -1 : 0}
					onClick={() => {
						onClick?.();
						window.location.assign("/invoices");
					}}
				>
					<span>{title}</span>
				</button>
			) : (
				<Link
					to={to}
					aria-label={ariaLabelText}
					className={commonClassName}
					tabIndex={active ? -1 : 0}
					onClick={onClick}
				>
					<span>{title}</span>
				</Link>
			)}
		</li>
	);
}

export default HeaderMenuLink;

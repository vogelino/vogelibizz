import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/utility/classNames";

function HeaderMenuLink({
	as = Link,
	onClick,
	href,
	title,
	className,
	active,
	ariaLabel,
}: {
	as?: typeof Link | string;
	onClick?: () => void;
	href?: string;
	title: ReactNode;
	ariaLabel?: string;
	className?: string;
	active?: boolean;
}) {
	const Tag = as;
	return (
		<li className="inline-block w-full sm:w-auto">
			<Tag
				href={href ?? "/"}
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
			</Tag>
		</li>
	);
}

export default HeaderMenuLink;

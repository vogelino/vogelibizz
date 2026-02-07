import { Link, type LinkProps } from "@tanstack/react-router";
import type React from "react";
import { cn } from "@/utility/classNames";

function InternalLink(
	props: Omit<LinkProps, "to"> & {
		href: LinkProps["to"];
		className?: string;
		children?: React.ReactNode;
	},
) {
	const { href, ...rest } = props;
	return (
		<Link
			{...rest}
			to={href}
			className={cn(
				`hyphen-auto`,
				`outline-none focusable px-3 py-2`,
				`bg-secondary/30 [text-decoration-skip-ink:none]`,
				`hover:bg-secondary`,
				`decoration-secondary`,
				`transition-colors motion-reduce:transition-none`,
				props.className,
			)}
		/>
	);
}

export default InternalLink;

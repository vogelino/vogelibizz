import type { LinkProps } from "next/link";
import Link from "next/link";
import type React from "react";
import { cn } from "@/utility/classNames";

function InternalLink(
	props: LinkProps & { className?: string; children?: React.ReactNode },
) {
	return (
		<Link
			{...props}
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

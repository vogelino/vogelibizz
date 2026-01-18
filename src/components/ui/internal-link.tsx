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
				`underline underline-offset-4 decoration-wavy`,
				`box-decoration-clone leading-relaxed hyphen-auto dark:decoration-from-font`,
				`outline-none focusable rounded-full -ml-3 px-3 pt-2 pb-1.5`,
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

import { useQueryClient } from "@tanstack/react-query";
import { Link, type LinkProps } from "@tanstack/react-router";
import type React from "react";
import { cn } from "@/utility/classNames";

function InternalLink(
	props: Omit<LinkProps, "to"> & {
		href: LinkProps["to"];
		className?: string;
		children?: React.ReactNode;
		prefetchQuery?: {
			queryKey: unknown[];
			queryFn: () => Promise<unknown>;
		};
	},
) {
	const { href, prefetchQuery, onMouseEnter, onFocus, ...rest } = props;
	const queryClient = useQueryClient();

	const handlePrefetch = () => {
		if (!prefetchQuery) return;
		void queryClient.prefetchQuery(prefetchQuery);
	};

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
			onMouseEnter={(event) => {
				handlePrefetch();
				onMouseEnter?.(event);
			}}
			onFocus={(event) => {
				handlePrefetch();
				onFocus?.(event);
			}}
		/>
	);
}

export default InternalLink;

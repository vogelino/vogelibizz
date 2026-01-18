"use client";

import { ArrowUp } from "lucide-react";
import BizzLogo from "@/components/BizzLogo";
import { cn } from "@/utility/classNames";

const year = new Date().getFullYear();

function Footer() {
	return (
		<footer className="pt-6 pb-5 border-t border-border bg-background relative">
			<section
				className={cn(
					`px-6 flex justify-between gap-4 flex-wrap uppercase items-center`,
					`tracking-wide text-muted-foreground`,
				)}
			>
				<span>{year}</span>
				<span>
					<BizzLogo className="scale-75" color="grayDark" />
				</span>
				<button
					id="back-to-top"
					type="button"
					aria-label="Scroll to top"
					className={cn(
						`p-1 bg-secondary text-secondary-foreground rounded-full`,
						`hover:bg-primary hover:text-primary-foreground transition-colors`,
						`focus-visible:ring-2 focus-visible:ring-ring outline-none`,
					)}
					onClick={() => {
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
				>
					<ArrowUp />
				</button>
			</section>
		</footer>
	);
}

export default Footer;

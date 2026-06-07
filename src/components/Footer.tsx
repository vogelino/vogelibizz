"use client";

import { ArrowUp } from "lucide-react";
import BizzLogo from "@/components/BizzLogo";
import { cn } from "@/utility/classNames";

const year = new Date().getFullYear();

function Footer() {
	return (
		<footer className="sticky left-0 pt-6 pb-5 border-t border-border bg-background">
			<section
				className={cn(
					`px-6 flex justify-between gap-4 flex-wrap uppercase items-center`,
					`tracking-wide text-muted-foreground relative`,
				)}
			>
				<span>{year}</span>
				<span>
					<BizzLogo className="scale-75" />
				</span>
				<button
					id="back-to-top"
					type="button"
					aria-label="Scroll to top"
					className={cn(
						`p-1 bg-secondary text-secondary-foreground`,
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

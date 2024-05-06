"use client";

import BizzLogo from "@/components/BizzLogo";
import { cn } from "@/utility/classNames";
import { ArrowUp } from "lucide-react";

const year = new Date().getFullYear();

function Footer() {
	return (
		<footer
			className="pt-6 pb-5 border-t border-grayMed bg-bg relative"
			aria-label="Main page footer"
		>
			<section
				className={cn(
					`px-6 flex justify-between gap-4 flex-wrap uppercase items-center`,
					`tracking-wide text-grayDark`,
				)}
			>
				<span aria-label={`Copyright ${year}`}>{year}</span>
				<span>
					<BizzLogo className="scale-75" color="grayDark" />
				</span>
				<button
					id="back-to-top"
					type="button"
					aria-label="Scroll to top"
					className={cn(
						`p-1 bg-alt text-fg rounded-full`,
						`hover:bg-fg hover:text-alt transition-colors`,
						`focus-visible:ring-2 focus-visible:ring-fg outline-none`,
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

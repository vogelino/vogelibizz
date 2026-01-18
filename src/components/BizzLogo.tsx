import { cn } from "@/utility/classNames";

type BizzLogoProps = {
	className?: string;
};
function BizzLogo({ className }: BizzLogoProps) {
	return (
		<span
			className={cn(
				"uppercase inline-block tracking-widest",
				"transition-colors font-semibold text-lg",
				className,
			)}
		>
			Bizz
		</span>
	);
}

export default BizzLogo;

type DashboardSectionProps = {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
};

export function DashboardSection({
	title,
	description,
	children,
	className = "",
}: DashboardSectionProps) {
	return (
		<section className={className}>
			<div className="mb-5">
				<h2 className="font-semibold">{title}</h2>
				{description ? (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			{children}
		</section>
	);
}

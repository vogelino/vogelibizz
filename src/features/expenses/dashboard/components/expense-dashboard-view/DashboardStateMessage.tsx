type DashboardStateMessageProps = {
	title: string;
	message: string;
};

export function DashboardStateMessage({
	title,
	message,
}: DashboardStateMessageProps) {
	return (
		<div className="px-6 py-12 text-center md:px-10">
			<h2 className="font-semibold">{title}</h2>
			<p className="mt-1 text-sm text-muted-foreground">{message}</p>
		</div>
	);
}

type DashboardSectionMessageProps = {
	children: React.ReactNode;
};

export function DashboardSectionMessage({
	children,
}: DashboardSectionMessageProps) {
	return <p className="text-sm text-muted-foreground">{children}</p>;
}

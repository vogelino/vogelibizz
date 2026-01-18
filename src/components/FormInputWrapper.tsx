import type { PropsWithChildren, ReactNode } from "react";

function FormInputWrapper({
	label,
	children,
	error,
}: PropsWithChildren<{ label: ReactNode; error?: string }>) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-muted-foreground">{label}</span>
			{children}
			{error && <span style={{ color: "red" }}>{error}</span>}
		</div>
	);
}

export default FormInputWrapper;

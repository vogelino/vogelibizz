import { useEffect, useRef } from "react";

export function SelectionCheckbox({
	checked,
	indeterminate,
	onChange,
	ariaLabel,
}: {
	checked: boolean;
	indeterminate: boolean;
	onChange: (checked: boolean) => void;
	ariaLabel: string;
}) {
	const ref = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (ref.current) {
			ref.current.indeterminate = !checked && indeterminate;
		}
	}, [checked, indeterminate]);

	return (
		<input
			ref={ref}
			type="checkbox"
			checked={checked}
			aria-label={ariaLabel}
			onChange={(event) => onChange(event.target.checked)}
			className="h-4 w-4 rounded border border-border bg-background text-primary focusable"
		/>
	);
}

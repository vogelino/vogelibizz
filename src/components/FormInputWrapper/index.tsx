import { PropsWithChildren, ReactNode } from 'react'

function FormInputWrapper({
	label,
	children,
	error,
}: PropsWithChildren<{ label: ReactNode; error?: string }>) {
	return (
		<label className="flex flex-col gap-2">
			<span className="text-grayDark">{label}</span>
			{children}
			{error && <span style={{ color: 'red' }}>{error}</span>}
		</label>
	)
}

export default FormInputWrapper

'use client'

import { Combobox } from '@components/ui/combobox'
import { useForm } from '@refinedev/react-hook-form'
import { statusList } from '@utility/statusUtil'
import React from 'react'

export default function ProjectEdit({ id }: { id: string }) {
	const {
		refineCore: { onFinish },
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		refineCoreProps: {
			resource: 'projects',
			id,
			meta: {
				select: '*',
			},
		},
	})

	return (
		<form onSubmit={handleSubmit(onFinish)} id={`project-edit-form-${id}`}>
			<div className="flex flex-col gap-4">
				<label className="flex flex-col gap-2">
					<span className="text-grayDark">Name</span>
					<input
						type="text"
						{...register('name', {
							required: 'This field is required',
						})}
					/>
					<input
						type="hidden"
						{...register('last_modified', {
							required: 'This field is required',
							setValueAs: () => new Date().toISOString(),
						})}
					/>
					<span style={{ color: 'red' }}>
						{(errors as any)?.title?.message as string}
					</span>
				</label>
				<label className="flex flex-col gap-2 w-fit">
					<span className="text-grayDark">Status</span>
					<Combobox
						className="h-auto pt-2 pb-1 border-grayMed"
						options={statusList}
						onChange={(value) => {
							register('status', {
								required: 'This field is required',
							}).onChange({ target: { value } })
						}}
					/>
					<span style={{ color: 'red' }}>
						{(errors as any)?.status?.message as string}
					</span>
				</label>
			</div>
		</form>
	)
}

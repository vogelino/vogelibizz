'use client'

import { Combobox } from '@components/ui/combobox'
import { useForm } from '@refinedev/react-hook-form'
import { statusList } from '@utility/statusUtil'
import React, { useRef } from 'react'

export default function ProjectCreate() {
	const [status, setStatus] = React.useState('todo')
	const [name, setName] = React.useState('')
	const last_modified = useRef(new Date().toISOString())

	const {
		refineCore: { onFinish },
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		refineCoreProps: {
			resource: 'projects',
			meta: {
				select: '*',
			},
		},
		values: { name, status, last_modified: last_modified.current },
	})
	const statusProps = register('status', {
		required: 'This field is required',
	})

	return (
		<form onSubmit={handleSubmit(onFinish)} id={`project-create-form`}>
			<div className="flex flex-col gap-4">
				<label className="flex flex-col gap-2">
					<span className="text-grayDark">Name</span>
					<input
						type="text"
						{...register('name', {
							required: 'This field is required',
						})}
						placeholder="Enter name for your project"
						onChange={(evt) => setName(evt.target.value)}
					/>
					<span style={{ color: 'red' }}>
						{(errors as any)?.title?.message as string}
					</span>
				</label>
				<label className="flex flex-col gap-2 w-fit">
					<span className="text-grayDark">Status</span>
					<input type="hidden" {...statusProps} />
					<Combobox
						className="h-auto pt-2 pb-1 border-grayMed"
						options={statusList}
						value={status}
						onChange={setStatus}
					/>
					<span style={{ color: 'red' }}>
						{(errors as any)?.status?.message as string}
					</span>
				</label>
			</div>
		</form>
	)
}

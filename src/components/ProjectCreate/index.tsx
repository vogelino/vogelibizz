'use client'

import { Combobox } from '@components/ui/combobox'
import { useForm } from '@refinedev/react-hook-form'
import { statusList } from '@utility/statusUtil'
import dynamic from 'next/dynamic'
import { forwardRef, useRef, useState } from 'react'
import { SimpleMDEReactProps } from 'react-simplemde-editor'

const DynamicEditor = dynamic(
	async () => (await import('@components/ui/text-editor')).TextareaEditor,
	{ ssr: false },
)
const ForwardedEditor = forwardRef<HTMLDivElement, SimpleMDEReactProps>(
	(props, ref) => <DynamicEditor forwardedRef={ref} {...props} />,
)
ForwardedEditor.displayName = 'ForwardedEditor'

export default function ProjectCreate() {
	const [status, setStatus] = useState('todo')
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [content, setContent] = useState('')
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
		values: {
			name,
			description,
			content,
			status,
			last_modified: last_modified.current,
		},
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
				<label className="flex flex-col gap-2">
					<span className="text-grayDark">Description</span>
					<input
						type="text"
						{...register('description', {
							required: 'This field is required',
						})}
						onChange={(evt) => setDescription(evt.target.value)}
					/>
					<span style={{ color: 'red' }}>
						{(errors as any)?.description?.message as string}
					</span>
				</label>
				<label className="flex flex-col gap-2">
					<span className="text-grayDark">Content</span>
					<ForwardedEditor
						{...register('content', {
							required: 'This field is required',
						})}
						value={content}
						onChange={setContent}
					/>
					<span style={{ color: 'red' }}>
						{(errors as any)?.content?.message as string}
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

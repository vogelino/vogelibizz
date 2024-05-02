"use client";

import FormInputCombobox from "@components/FormInputCombobox";
import FormInputWrapper from "@components/FormInputWrapper";
import type { ProjectType } from "@db/schema";
import { useForm } from "@refinedev/react-hook-form";
import type { FormErrorsType } from "@utility/formUtil";
import { statusList } from "@utility/statusUtil";
import dynamic from "next/dynamic";
import { forwardRef, useRef, useState } from "react";
import type { SimpleMDEReactProps } from "react-simplemde-editor";

const DynamicEditor = dynamic(
	async () => (await import("@components/ui/text-editor")).TextareaEditor,
	{ ssr: false },
);
const ForwardedEditor = forwardRef<HTMLDivElement, SimpleMDEReactProps>(
	(props, ref) => <DynamicEditor forwardedRef={ref} {...props} />,
);
ForwardedEditor.displayName = "ForwardedEditor";

export default function ProjectEdit({
	id,
	formId,
	initialData,
}: {
	id?: string;
	formId: string;
	initialData?: ProjectType;
}) {
	const [status, setStatus] = useState(initialData?.status || "todo");
	const [name, setName] = useState(initialData?.name || "");
	const [description, setDescription] = useState(
		initialData?.description || "",
	);
	const [content, setContent] = useState(initialData?.content || "");
	const last_modified = useRef(new Date().toISOString());

	const values = {
		name,
		status,
		last_modified: last_modified.current,
		description,
		content,
	};
	const {
		refineCore: { onFinish },
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		refineCoreProps: {
			resource: "projects",
			id,
			meta: {
				select: "*",
			},
		},
		values,
	});
	const statusProps = register("status", {
		required: "This field is required",
	});
	const allErrors = errors as FormErrorsType<typeof values>;

	return (
		<form onSubmit={handleSubmit(onFinish)} id={formId}>
			<div className="flex flex-col gap-4">
				<FormInputWrapper label="Name" error={allErrors?.name?.message}>
					<input
						type="text"
						{...register("name", {
							required: "This field is required",
						})}
						onChange={(evt) => setName(evt.target.value)}
						className="form-input"
					/>
				</FormInputWrapper>
				<FormInputWrapper
					label="Description"
					error={allErrors?.description?.message}
				>
					<input
						type="text"
						{...register("description", {
							required: "This field is required",
						})}
						className="form-input"
						onChange={(evt) => setDescription(evt.target.value)}
					/>
				</FormInputWrapper>
				<FormInputWrapper label="Content" error={allErrors?.content?.message}>
					<ForwardedEditor
						{...register("content", {
							required: "This field is required",
						})}
						value={content}
						onChange={setContent}
					/>
				</FormInputWrapper>
				<FormInputCombobox<ProjectType["status"]>
					options={statusList}
					inputProps={statusProps}
					label="Status"
					value={status}
					onChange={setStatus}
					error={allErrors?.status?.message}
					className="w-full"
				/>
			</div>
		</form>
	);
}

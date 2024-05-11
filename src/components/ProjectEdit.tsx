"use client";

import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import type { ProjectType } from "@/db/schema";
import env from "@/env";
import useProject from "@/utility/data/useProject";
import useProjectCreate from "@/utility/data/useProjectCreate";
import useProjectEdit from "@/utility/data/useProjectEdit";
import { statusList } from "@/utility/statusUtil";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { SimpleMDEReactProps } from "react-simplemde-editor";

const DynamicEditor = dynamic(
	async () => (await import("@/components/ui/text-editor")).TextareaEditor,
	{ ssr: false },
);
const ForwardedEditor = forwardRef<HTMLDivElement, SimpleMDEReactProps>(
	(props, ref) => <DynamicEditor forwardedRef={ref} {...props} />,
);
ForwardedEditor.displayName = "ForwardedEditor";

export default function ProjectEdit({
	id,
	formId,
}: {
	id?: string | number;
	formId: string;
}) {
	const router = useRouter();
	const editMutation = useProjectEdit();
	const createMutation = useProjectCreate();
	const { data: project } = useProject(id);
	const [status, setStatus] = useState(project?.status ?? "active");
	const [content, setContent] = useState(project?.content ?? "");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: project?.name ?? "",
			content,
			status,
			description: project?.description ?? "",
		},
	});
	const statusProps = register("status", {
		required: "This field is required",
	});

	return (
		<form
			onSubmit={handleSubmit((values) => {
				router.push(`${env.client.NEXT_PUBLIC_BASE_URL}/projects`);
				const project = { ...values, content, status };
				if (id) editMutation.mutate({ ...project, id });
				else createMutation.mutate([project]);
			})}
			id={formId}
		>
			<div className="flex flex-col gap-4">
				<FormInputWrapper label="Name" error={errors?.name?.message}>
					<input
						type="text"
						{...register("name", {
							required: "This field is required",
						})}
						className="form-input"
						defaultValue={project?.name || ""}
					/>
				</FormInputWrapper>
				<FormInputWrapper
					label="Description"
					error={errors?.description?.message}
				>
					<input
						type="text"
						{...register("description", {
							required: "This field is required",
						})}
						className="form-input"
						defaultValue={project?.description || ""}
					/>
				</FormInputWrapper>
				<FormInputWrapper label="Content" error={errors?.content?.message}>
					<ForwardedEditor value={content} onChange={setContent} />
				</FormInputWrapper>
				<FormInputCombobox<ProjectType["status"]>
					onChange={setStatus}
					value={status}
					options={statusList}
					inputProps={statusProps}
					label="Status"
					error={errors?.status?.message}
					className="w-full"
				/>
			</div>
		</form>
	);
}

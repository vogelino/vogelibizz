"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SimpleMDEReactProps } from "react-simplemde-editor";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import type { ClientType, ProjectType } from "@/db/schema";
import env from "@/env";
import useClients from "@/utility/data/useClients";
import useProject from "@/utility/data/useProject";
import useProjectCreate from "@/utility/data/useProjectCreate";
import useProjectEdit from "@/utility/data/useProjectEdit";
import { statusList } from "@/utility/statusUtil";
import useComboboxOptions, {
	type OptionType,
} from "@/utility/useComboboxOptions";
import { MultiValueInput } from "./ui/multi-value-input";

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
	const clientsQuery = useClients();
	const editMutation = useProjectEdit();
	const createMutation = useProjectCreate();
	const projectQuery = useProject(id);
	const { data: project } = projectQuery;
	const [status, setStatus] = useState(project?.status ?? "active");
	const [content, setContent] = useState(project?.content ?? "");
	const [projectClients, setProjectClients] = useState<
		{
			id: number;
			name: string;
		}[]
	>(project?.clients || []);

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

	useEffect(() => {
		setProjectClients(project?.clients || []);
	}, [project?.clients]);

	const clientsOptions = useComboboxOptions<ClientType>({
		optionValues: clientsQuery.data,
		renderer: (client) => client?.name || "",
		accessorFn: ({ id }) => String(id),
	});

	const onProjectsChange = useCallback(
		(newValues: OptionType[]) => {
			setProjectClients(
				newValues.reduce(
					(acc, option) => {
						const client = clientsQuery.data?.find(
							(client) => String(client.id) === String(option.value),
						);
						if (client) acc.push(client);
						return acc;
					},
					[] as { id: number; name: string }[],
				),
			);
		},
		[clientsQuery.data],
	);

	return (
		<form
			onSubmit={handleSubmit((values) => {
				router.push(`${env.client.NEXT_PUBLIC_BASE_URL}/projects`);
				const project = { ...values, content, status, clients: projectClients };
				if (id) editMutation.mutate({ ...project, id: Number(id) });
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
					<div className="bg-bg dark:bg-grayUltraLight border border-grayMed min-h-[356px]">
						<ForwardedEditor value={content} onChange={setContent} />
					</div>
				</FormInputWrapper>
				<FormInputCombobox
					onChange={(val) => setStatus(val as ProjectType["status"])}
					value={status}
					options={statusList}
					inputProps={statusProps}
					label="Status"
					error={errors?.status?.message}
					className="w-full"
				/>
				{!projectQuery.error && !projectQuery.isPending && (
					<div className="flex flex-col gap-1">
						<span className="text-grayDark">Clients</span>
						<MultiValueInput
							options={clientsOptions}
							values={projectClients.map((client) => String(client.id)) || []}
							placeholder="Select the projects' clients"
							className="w-full"
							onChange={onProjectsChange}
						/>
					</div>
				)}
			</div>
		</form>
	);
}

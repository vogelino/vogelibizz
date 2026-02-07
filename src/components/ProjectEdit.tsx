"use client";

import { useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ClientOnly from "@/components/ClientOnly";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientType, ProjectType } from "@/db/schema";
import useClients from "@/utility/data/useClients";
import useProject from "@/utility/data/useProject";
import useProjectCreate from "@/utility/data/useProjectCreate";
import useProjectEdit from "@/utility/data/useProjectEdit";
import { statusList } from "@/utility/statusUtil";
import useComboboxOptions, {
	type OptionType,
} from "@/utility/useComboboxOptions";
import { MultiValueInput } from "./ui/multi-value-input";

const TextareaEditor = lazy(async () => {
	const mod = await import("@/components/ui/text-editor");
	return { default: mod.TextareaEditor };
});

export default function ProjectEdit({
	id,
	formId,
	initialData,
	loading = false,
}: {
	id?: string | number;
	formId: string;
	initialData?: ProjectType;
	loading?: boolean;
}) {
	const navigate = useNavigate();
	const clientsQuery = useClients();
	const editMutation = useProjectEdit();
	const createMutation = useProjectCreate();
	const projectQuery = useProject(id, initialData);
	const { data: project } = projectQuery;
	const isLoading = loading || (Boolean(id) && projectQuery.isPending);
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
		reset,
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
		if (!project) return;
		setStatus(project.status ?? "active");
		setContent(project.content ?? "");
		setProjectClients(project.clients || []);
		reset({
			name: project.name ?? "",
			content: project.content ?? "",
			status: project.status ?? "active",
			description: project.description ?? "",
		});
	}, [project, reset]);

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
				navigate({ to: "/projects" });
				const project = { ...values, content, status, clients: projectClients };
				if (id) editMutation.mutate({ ...project, id: Number(id) });
				else createMutation.mutate([project]);
			})}
			id={formId}
		>
			<div className="flex flex-col gap-4">
				<FormInputWrapper
					label="Name"
					error={errors?.name?.message}
					loading={isLoading}
					loadingChildren={<Skeleton className="h-9 w-full" />}
				>
					{!isLoading && (
						<input
							type="text"
							{...register("name", {
								required: "This field is required",
							})}
							className="form-input"
							defaultValue={project?.name || ""}
						/>
					)}
				</FormInputWrapper>
				<FormInputWrapper
					label="Description"
					error={errors?.description?.message}
					loading={isLoading}
					loadingChildren={<Skeleton className="h-9 w-full" />}
				>
					{!isLoading && (
						<input
							type="text"
							{...register("description", {
								required: "This field is required",
							})}
							className="form-input"
							defaultValue={project?.description || ""}
						/>
					)}
				</FormInputWrapper>
				<FormInputWrapper
					label="Content"
					error={errors?.content?.message}
					loading={isLoading}
					loadingChildren={<Skeleton className="h-32 w-full" />}
				>
					{!isLoading && (
						<div className="bg-background dark:bg-card border border-border min-h-89">
							<ClientOnly fallback={<div className="p-4 text-sm">Loading…</div>}>
								<Suspense fallback={<div className="p-4 text-sm">Loading…</div>}>
									<TextareaEditor value={content} onChange={setContent} />
								</Suspense>
							</ClientOnly>
						</div>
					)}
				</FormInputWrapper>
				<FormInputCombobox
					onChange={(val) => setStatus(val as ProjectType["status"])}
					value={status}
					options={statusList}
					inputProps={statusProps}
					label="Status"
					error={errors?.status?.message}
					className="w-full"
					loading={isLoading}
				/>
				<div className="flex flex-col gap-1">
					<span className="text-muted-foreground">Clients</span>
					<MultiValueInput
						options={clientsOptions}
						values={projectClients.map((client) => String(client.id)) || []}
						placeholder="Select the projects' clients"
						className="w-full"
						onChange={onProjectsChange}
						loading={isLoading || clientsQuery.isPending}
					/>
				</div>
			</div>
		</form>
	);
}

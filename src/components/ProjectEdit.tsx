"use client";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
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
	initialClients,
	loading = false,
}: {
	id?: string | number;
	formId: string;
	initialData?: ProjectType;
	initialClients?: ClientType[];
	loading?: boolean;
}) {
	const navigate = useNavigate();
	const clientsQuery = useClients({ initialData: initialClients });
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

	const form = useForm({
		defaultValues: {
			name: project?.name ?? "",
			description: project?.description ?? "",
			hourlyRate: project?.hourlyRate ?? 50,
		},
		onSubmit: async ({ value }) => {
			navigate({ to: "/projects" });
			const projectData = {
				...value,
				content,
				status,
				clients: projectClients,
			};
			if (id) editMutation.mutate({ ...projectData, id: Number(id) });
			else createMutation.mutate([projectData]);
		},
	});

	useEffect(() => {
		if (!project) return;
		setStatus(project.status ?? "active");
		setContent(project.content ?? "");
		setProjectClients(project.clients || []);
		form.setFieldValue("name", project.name ?? "");
		form.setFieldValue("description", project.description ?? "");
		form.setFieldValue("hourlyRate", project.hourlyRate ?? 50);
	}, [project, form.setFieldValue]);

	const clientsOptions = useComboboxOptions<ClientType>({
		optionValues: clientsQuery.data ?? [],
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
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			id={formId}
		>
			<div className="flex flex-col gap-4">
				<form.Field
					name="name"
					validators={{
						onSubmit: ({ value }) =>
							!value ? "This field is required" : undefined,
					}}
				>
					{(field) => (
						<FormInputWrapper
							label="Name"
							error={field.state.meta.errors[0]?.toString()}
							loading={isLoading}
							loadingChildren={<Skeleton className="h-9 w-full" />}
						>
							{!isLoading && (
								<input
									type="text"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="form-input"
									// biome-ignore lint/a11y/noAutofocus: intentional focus on modal open
									autoFocus
								/>
							)}
						</FormInputWrapper>
					)}
				</form.Field>
				<form.Field
					name="description"
					validators={{
						onSubmit: ({ value }) =>
							!value ? "This field is required" : undefined,
					}}
				>
					{(field) => (
						<FormInputWrapper
							label="Description"
							error={field.state.meta.errors[0]?.toString()}
							loading={isLoading}
							loadingChildren={<Skeleton className="h-9 w-full" />}
						>
							{!isLoading && (
								<input
									type="text"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="form-input"
								/>
							)}
						</FormInputWrapper>
					)}
				</form.Field>
				<FormInputWrapper
					label="Content"
					loading={isLoading}
					loadingChildren={<Skeleton className="h-32 w-full" />}
				>
					{!isLoading && (
						<div className="bg-background dark:bg-card border border-border min-h-89">
							<ClientOnly
								fallback={<div className="p-4 text-sm">Loading…</div>}
							>
								<Suspense
									fallback={<div className="p-4 text-sm">Loading…</div>}
								>
									<TextareaEditor value={content} onChange={setContent} />
								</Suspense>
							</ClientOnly>
						</div>
					)}
				</FormInputWrapper>
				<form.Field name="hourlyRate">
					{(field) => (
						<FormInputWrapper
							label="Hourly rate"
							loading={isLoading}
							loadingChildren={<Skeleton className="h-9 w-full" />}
						>
							{!isLoading && (
								<input
									type="number"
									min={0}
									step={1}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(Number(e.target.value || 0))
									}
									className="form-input"
								/>
							)}
						</FormInputWrapper>
					)}
				</form.Field>
				<FormInputCombobox
					onChange={(val) => setStatus(val as ProjectType["status"])}
					value={status}
					options={statusList}
					label="Status"
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

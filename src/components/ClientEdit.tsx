"use client";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import FormInputWrapper from "@/components/FormInputWrapper";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientType, ProjectType } from "@/db/schema";
import useClient from "@/utility/data/useClient";
import useClientCreate from "@/utility/data/useClientCreate";
import useClientEdit from "@/utility/data/useClientEdit";
import useProjects from "@/utility/data/useProjects";
import useComboboxOptions, {
	type OptionType,
} from "@/utility/useComboboxOptions";

export default function ClientEdit({
	id,
	formId,
	initialData,
	initialProjects,
	loading = false,
}: {
	id?: number | undefined;
	formId: string;
	initialData?: ClientType;
	initialProjects?: ProjectType[];
	loading?: boolean;
}) {
	const navigate = useNavigate();
	const clientQuery = useClient(id, initialData);
	const { data: client } = clientQuery;
	const isLoading = loading || (Boolean(id) && clientQuery.isPending);
	const projectsQuery = useProjects({ initialData: initialProjects });
	const editMutation = useClientEdit();
	const [clientProjects, setClientProjects] = useState<
		{
			id: number;
			name: string;
		}[]
	>(client?.projects || []);
	const createMutation = useClientCreate();

	const form = useForm({
		defaultValues: {
			name: client?.name ?? "",
		},
		onSubmit: async ({ value }) => {
			navigate({ to: "/clients" });
			const clientData = {
				name: value.name,
				projects: clientProjects,
			};
			if (id) editMutation.mutate({ ...clientData, id });
			else createMutation.mutate([clientData]);
		},
	});

	useEffect(() => {
		if (!client) return;
		setClientProjects(client?.projects || []);
		form.setFieldValue("name", client.name ?? "");
	}, [client, form.setFieldValue]);

	const projectsOptions = useComboboxOptions<ProjectType>({
		optionValues: projectsQuery.data ?? [],
		renderer: (project) => project?.name || "",
		accessorFn: ({ id }) => String(id),
	});

	const onProjectsChange = useCallback(
		(newValues: OptionType[]) => {
			setClientProjects(
				newValues.reduce(
					(acc, option) => {
						const project = projectsQuery.data?.find(
							(project) => String(project.id) === option.value,
						);
						if (project) acc.push(project);
						return acc;
					},
					[] as { id: number; name: string }[],
				),
			);
		},
		[projectsQuery.data],
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
			<div className="flex flex-col gap-6">
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
				<div className="flex flex-col gap-1">
					<span className="text-muted-foreground">Projects</span>
					<MultiValueInput
						options={projectsOptions}
						values={clientProjects.map((project) => String(project.id)) || []}
						placeholder="Select the clients' projects"
						className="w-full"
						onChange={onProjectsChange}
						loading={isLoading || projectsQuery.isPending}
					/>
				</div>
			</div>
		</form>
	);
}

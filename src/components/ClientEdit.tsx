"use client";

import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
	loading = false,
}: {
	id?: number | undefined;
	formId: string;
	initialData?: ClientType;
	loading?: boolean;
}) {
	const navigate = useNavigate();
	const clientQuery = useClient(id, initialData);
	const { data: client } = clientQuery;
	const isLoading = loading || (Boolean(id) && clientQuery.isPending);
	const projectsQuery = useProjects();
	const editMutation = useClientEdit();
	const [clientProjects, setClientProjects] = useState<
		{
			id: number;
			name: string;
		}[]
	>(client?.projects || []);
	const createMutation = useClientCreate();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: client?.name,
		},
	});

	useEffect(() => {
		if (!client) return;
		setClientProjects(client?.projects || []);
		reset({
			name: client.name ?? "",
		});
	}, [client, reset]);

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
			onSubmit={handleSubmit((values) => {
				navigate({ to: "/clients" });
				const client = {
					...values,
					name: values.name ?? "",
					projects: clientProjects,
				};
				if (id) editMutation.mutate({ ...client, id });
				else createMutation.mutate([client]);
			})}
			id={formId}
		>
			<div className="flex flex-col gap-6">
				<FormInputWrapper
					label="Name"
					error={
						typeof errors.name?.message === "string"
							? errors.name.message
							: undefined
					}
					loading={isLoading}
					loadingChildren={<Skeleton className="h-9 w-full" />}
				>
					{!isLoading && (
						<input
							type="text"
							{...register("name", {
								required: "This field is required",
							})}
							defaultValue={client?.name}
							className="form-input"
						/>
					)}
				</FormInputWrapper>
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

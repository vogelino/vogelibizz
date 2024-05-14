"use client";

import { MultiValueInput } from "@/components/ui/multi-value-input";
import type { ProjectType } from "@/db/schema";
import env from "@/env";
import useClient from "@/utility/data/useClient";
import useClientCreate from "@/utility/data/useClientCreate";
import useClientEdit from "@/utility/data/useClientEdit";
import useProjects from "@/utility/data/useProjects";
import useComboboxOptions, {
	type OptionType,
} from "@/utility/useComboboxOptions";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function ClientEdit({
	id,
	formId,
}: { id?: number | undefined; formId: string }) {
	const router = useRouter();
	const clientQuery = useClient(id);
	const { data: client } = clientQuery;
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
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: client?.name,
		},
	});

	useEffect(() => {
		setClientProjects(client?.projects || []);
	}, [client?.projects]);

	const projectsOptions = useComboboxOptions<ProjectType>({
		optionValues: projectsQuery.data,
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
				router.push(`${env.client.NEXT_PUBLIC_BASE_URL}/clients`);
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
				<label className="flex flex-col gap-1">
					<span className="text-grayDark">Name</span>
					<input
						type="text"
						{...register("name", {
							required: "This field is required",
						})}
						defaultValue={client?.name}
						className="form-input"
					/>
					{typeof errors.name?.message === "string" && errors.name.message}
				</label>
				{!clientQuery.error && !clientQuery.isPending && (
					<label className="flex flex-col gap-1">
						<span className="text-grayDark">Projects</span>
						<MultiValueInput
							options={projectsOptions}
							values={clientProjects.map((project) => String(project.id)) || []}
							placeholder="Select the clients' projects"
							className="w-full"
							onChange={onProjectsChange}
						/>
					</label>
				)}
			</div>
		</form>
	);
}

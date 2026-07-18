"use client";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ClientType,
	clientLanguageEnum,
	type ProjectType,
} from "@/db/schema";
import useClient from "@/utility/data/useClient";
import useClientCreate from "@/utility/data/useClientCreate";
import useClientEdit from "@/utility/data/useClientEdit";
import useProjects from "@/utility/data/useProjects";
import useComboboxOptions, {
	type OptionType,
} from "@/utility/useComboboxOptions";

function isClientLanguageValue(
	value: string | number,
): value is ClientType["language"] {
	return clientLanguageEnum.enumValues.some((language) => language === value);
}

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
			clientNumber: client?.clientNumber ?? "",
			language: client?.language ?? "de-DE",
			legalName: client?.legalName ?? "",
			addressLine1: client?.addressLine1 ?? "",
			addressLine2: client?.addressLine2 ?? "",
			addressLine3: client?.addressLine3 ?? "",
			taxId: client?.taxId ?? "",
		},
		onSubmit: async ({ value }) => {
			navigate({ to: "/clients" });
			const clientData = {
				...value,
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
		form.setFieldValue("clientNumber", client.clientNumber ?? "");
		form.setFieldValue("language", client.language ?? "de-DE");
		form.setFieldValue("legalName", client.legalName ?? "");
		form.setFieldValue("addressLine1", client.addressLine1 ?? "");
		form.setFieldValue("addressLine2", client.addressLine2 ?? "");
		form.setFieldValue("addressLine3", client.addressLine3 ?? "");
		form.setFieldValue("taxId", client.taxId ?? "");
	}, [client, form.setFieldValue]);

	const projectsOptions = useComboboxOptions<ProjectType>({
		optionValues: projectsQuery.data ?? [],
		renderer: (project) => project?.name || "",
		accessorFn: ({ id }) => id,
	});
	const languageOptions = useMemo(
		() =>
			clientLanguageEnum.enumValues.map((language) => ({
				label: language,
				value: language,
			})),
		[],
	);

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
				<form.Field name="clientNumber">
					{(field) => (
						<FormInputWrapper
							label="Client #"
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
				<form.Field name="language">
					{(field) => (
						<FormInputCombobox
							label="Language"
							value={field.state.value}
							onChange={(value) => {
								if (isClientLanguageValue(value)) field.handleChange(value);
							}}
							options={languageOptions}
							className="w-full"
							loading={isLoading}
						/>
					)}
				</form.Field>
				<form.Field name="legalName">
					{(field) => (
						<FormInputWrapper
							label="Legal name"
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
				<form.Field name="addressLine1">
					{(field) => (
						<FormInputWrapper
							label="Address line 1"
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
				<form.Field name="addressLine2">
					{(field) => (
						<FormInputWrapper
							label="Address line 2"
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
				<form.Field name="addressLine3">
					{(field) => (
						<FormInputWrapper
							label="Address line 3"
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
				<form.Field name="taxId">
					{(field) => (
						<FormInputWrapper
							label="Tax ID"
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

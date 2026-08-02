"use client";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ClientType,
	clientLanguageEnum,
	type ProjectType,
} from "@/db/schema";
import {
	applyRelationIntents,
	commonValue,
	getRelationCounts,
	hasCommonValue,
	pickChanged,
	type RelationIntent,
	relationsFromOptionValues,
	unionRelations,
} from "@/utility/bulkEdit";
import useClient from "@/utility/data/useClient";
import useClientCreate from "@/utility/data/useClientCreate";
import useClientEdit from "@/utility/data/useClientEdit";
import useProjects from "@/utility/data/useProjects";
import useResourceBatchMutations from "@/utility/data/useResourceBatchMutations";
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
	bulkItems,
	onBulkComplete,
	loading = false,
}: {
	id?: number | undefined;
	formId: string;
	initialData?: ClientType;
	initialProjects?: ProjectType[];
	bulkItems?: ClientType[];
	onBulkComplete?: () => void;
	loading?: boolean;
}) {
	const isBulk = Boolean(bulkItems?.length);
	const changedFields = useRef(
		new Set<
			| "name"
			| "clientNumber"
			| "language"
			| "legalName"
			| "addressLine1"
			| "addressLine2"
			| "addressLine3"
			| "taxId"
			| "projects"
		>(),
	);
	const navigate = useNavigate();
	const clientQuery = useClient(id, id ? initialData : undefined);
	const bulkClient = useMemo(() => {
		if (!bulkItems?.length) return undefined;
		return {
			...bulkItems[0],
			name: commonValue(bulkItems, "name") ?? "",
			clientNumber: commonValue(bulkItems, "clientNumber") ?? "",
			language:
				commonValue(bulkItems, "language") ?? ("" as ClientType["language"]),
			legalName: commonValue(bulkItems, "legalName") ?? "",
			addressLine1: commonValue(bulkItems, "addressLine1") ?? "",
			addressLine2: commonValue(bulkItems, "addressLine2") ?? "",
			addressLine3: commonValue(bulkItems, "addressLine3") ?? "",
			taxId: commonValue(bulkItems, "taxId") ?? "",
			projects: unionRelations(
				bulkItems.map((item) => ({ relations: item.projects })),
			),
		};
	}, [bulkItems]);
	const client = isBulk ? bulkClient : id ? clientQuery.data : initialData;
	const mixed = (key: keyof ClientType) =>
		Boolean(isBulk && bulkItems && !hasCommonValue(bulkItems, key));
	const isLoading = loading || (Boolean(id) && clientQuery.isPending);
	const projectsQuery = useProjects({ initialData: initialProjects });
	const editMutation = useClientEdit();
	const batchMutation = useResourceBatchMutations("clients").edit;
	const [clientProjects, setClientProjects] = useState<
		{
			id: number;
			name: string;
		}[]
	>(client?.projects || []);
	const [projectIntents, setProjectIntents] = useState<
		Record<string, RelationIntent>
	>({});
	const projectCounts = useMemo(
		() =>
			getRelationCounts((bulkItems ?? []).map((item) => item.projects ?? [])),
		[bulkItems],
	);
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
			const clientData = {
				...value,
				projects: clientProjects,
			};
			if (isBulk && bulkItems) {
				const changes = pickChanged(clientData, changedFields.current);
				const items = bulkItems.map((item) => {
					const itemChanges = { ...changes };
					if (Object.keys(projectIntents).length > 0) {
						itemChanges.projects = applyRelationIntents(
							item.projects ?? [],
							projectsQuery.data ?? [],
							projectIntents,
						);
					}
					return { id: item.id, ...itemChanges };
				});
				await batchMutation.mutateAsync(items);
				onBulkComplete?.();
				return;
			}
			navigate({ to: "/clients" });
			if (id) editMutation.mutate({ ...clientData, id });
			else createMutation.mutate([clientData]);
		},
	});

	useEffect(() => {
		if (!client) return;
		changedFields.current.clear();
		setProjectIntents({});
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
			changedFields.current.add("projects");
			setClientProjects(
				relationsFromOptionValues(newValues, projectsQuery.data ?? []),
			);
		},
		[projectsQuery.data],
	);
	const onProjectIntentChange = useCallback(
		(value: string | number, intent?: RelationIntent) => {
			setProjectIntents((current) => {
				const next = { ...current };
				if (intent) next[String(value)] = intent;
				else delete next[String(value)];
				if (Object.keys(next).length > 0) changedFields.current.add("projects");
				else changedFields.current.delete("projects");
				return next;
			});
		},
		[],
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
							!value && (!isBulk || changedFields.current.has("name"))
								? "This field is required"
								: undefined,
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
									onChange={(e) => {
										changedFields.current.add("name");
										field.handleChange(e.target.value);
									}}
									placeholder={mixed("name") ? "Multiple values" : undefined}
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
									onChange={(e) => {
										changedFields.current.add("clientNumber");
										field.handleChange(e.target.value);
									}}
									placeholder={
										mixed("clientNumber") ? "Multiple values" : undefined
									}
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
								if (isClientLanguageValue(value)) {
									changedFields.current.add("language");
									field.handleChange(value);
								}
							}}
							options={languageOptions}
							placeholder={mixed("language") ? "Multiple values" : undefined}
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
									onChange={(e) => {
										changedFields.current.add("legalName");
										field.handleChange(e.target.value);
									}}
									placeholder={
										mixed("legalName") ? "Multiple values" : undefined
									}
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
									onChange={(e) => {
										changedFields.current.add("addressLine1");
										field.handleChange(e.target.value);
									}}
									placeholder={
										mixed("addressLine1") ? "Multiple values" : undefined
									}
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
									onChange={(e) => {
										changedFields.current.add("addressLine2");
										field.handleChange(e.target.value);
									}}
									placeholder={
										mixed("addressLine2") ? "Multiple values" : undefined
									}
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
									onChange={(e) => {
										changedFields.current.add("addressLine3");
										field.handleChange(e.target.value);
									}}
									placeholder={
										mixed("addressLine3") ? "Multiple values" : undefined
									}
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
									onChange={(e) => {
										changedFields.current.add("taxId");
										field.handleChange(e.target.value);
									}}
									placeholder={mixed("taxId") ? "Multiple values" : undefined}
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
						changeBaselineValues={
							isBulk
								? bulkClient?.projects?.map((project) => String(project.id))
								: undefined
						}
						valueCounts={isBulk ? projectCounts : undefined}
						totalValueCount={isBulk ? bulkItems?.length : undefined}
						valueIntents={isBulk ? projectIntents : undefined}
						onValueIntentChange={isBulk ? onProjectIntentChange : undefined}
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

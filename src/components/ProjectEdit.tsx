"use client";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ClientOnly from "@/components/ClientOnly";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientType, ProjectType } from "@/db/schema";
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
import useClients from "@/utility/data/useClients";
import useProject from "@/utility/data/useProject";
import useProjectCreate from "@/utility/data/useProjectCreate";
import useProjectEdit from "@/utility/data/useProjectEdit";
import useResourceBatchMutations from "@/utility/data/useResourceBatchMutations";
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
	bulkItems,
	onBulkComplete,
	loading = false,
}: {
	id?: string | number;
	formId: string;
	initialData?: ProjectType;
	initialClients?: ClientType[];
	bulkItems?: ProjectType[];
	onBulkComplete?: () => void;
	loading?: boolean;
}) {
	const isBulk = Boolean(bulkItems?.length);
	const changedFields = useRef(
		new Set<
			"name" | "description" | "hourlyRate" | "status" | "content" | "clients"
		>(),
	);
	const navigate = useNavigate();
	const clientsQuery = useClients({ initialData: initialClients });
	const editMutation = useProjectEdit();
	const batchMutation = useResourceBatchMutations("projects").edit;
	const createMutation = useProjectCreate();
	const projectQuery = useProject(id, id ? initialData : undefined);
	const bulkProject = useMemo(() => {
		if (!bulkItems?.length) return undefined;
		return {
			...bulkItems[0],
			name: commonValue(bulkItems, "name") ?? "",
			description: commonValue(bulkItems, "description") ?? "",
			hourlyRate: commonValue(bulkItems, "hourlyRate"),
			status: commonValue(bulkItems, "status") ?? ("" as ProjectType["status"]),
			content: commonValue(bulkItems, "content") ?? "",
			clients: unionRelations(
				bulkItems.map((item) => ({ relations: item.clients })),
			),
		};
	}, [bulkItems]);
	const project = isBulk ? bulkProject : id ? projectQuery.data : initialData;
	const mixed = (key: keyof ProjectType) =>
		Boolean(isBulk && bulkItems && !hasCommonValue(bulkItems, key));
	const isLoading = loading || (Boolean(id) && projectQuery.isPending);
	const [status, setStatus] = useState(project?.status ?? "active");
	const [content, setContent] = useState(project?.content ?? "");
	const [projectClients, setProjectClients] = useState<
		{
			id: number;
			name: string;
		}[]
	>(project?.clients || []);
	const [clientIntents, setClientIntents] = useState<
		Record<string, RelationIntent>
	>({});
	const clientCounts = useMemo(
		() =>
			getRelationCounts((bulkItems ?? []).map((item) => item.clients ?? [])),
		[bulkItems],
	);

	const form = useForm({
		defaultValues: {
			name: project?.name ?? "",
			description: project?.description ?? "",
			hourlyRate: project?.hourlyRate ?? (isBulk ? "" : 50),
		},
		onSubmit: async ({ value }) => {
			const projectData = {
				...value,
				hourlyRate: Number(value.hourlyRate || 0),
				content,
				status,
				clients: projectClients,
			};
			if (isBulk && bulkItems) {
				const changes = pickChanged(projectData, changedFields.current);
				const items = bulkItems.map((item) => {
					const itemChanges = { ...changes };
					if (Object.keys(clientIntents).length > 0) {
						itemChanges.clients = applyRelationIntents(
							item.clients ?? [],
							clientsQuery.data ?? [],
							clientIntents,
						);
					}
					const {
						created_at: _createdAt,
						last_modified: _lastModified,
						...editableItem
					} = item;
					return {
						...editableItem,
						...itemChanges,
						id: item.id,
					};
				});
				await batchMutation.mutateAsync(items);
				onBulkComplete?.();
				return;
			}
			navigate({ to: "/projects" });
			if (id) editMutation.mutate({ ...projectData, id: Number(id) });
			else createMutation.mutate([projectData]);
		},
	});

	useEffect(() => {
		if (!project) return;
		changedFields.current.clear();
		setClientIntents({});
		setStatus(project.status ?? "active");
		setContent(project.content ?? "");
		setProjectClients(project.clients || []);
		form.setFieldValue("name", project.name ?? "");
		form.setFieldValue("description", project.description ?? "");
		form.setFieldValue("hourlyRate", project.hourlyRate ?? (isBulk ? "" : 50));
	}, [project, form.setFieldValue, isBulk]);

	const clientsOptions = useComboboxOptions<ClientType>({
		optionValues: clientsQuery.data ?? [],
		renderer: (client) => client?.name || "",
		accessorFn: ({ id }) => String(id),
	});

	const onProjectsChange = useCallback(
		(newValues: OptionType[]) => {
			changedFields.current.add("clients");
			setProjectClients(
				relationsFromOptionValues(newValues, clientsQuery.data ?? []),
			);
		},
		[clientsQuery.data],
	);
	const onClientIntentChange = useCallback(
		(value: string | number, intent?: RelationIntent) => {
			setClientIntents((current) => {
				const next = { ...current };
				if (intent) next[String(value)] = intent;
				else delete next[String(value)];
				if (Object.keys(next).length > 0) changedFields.current.add("clients");
				else changedFields.current.delete("clients");
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
			<div className="flex flex-col gap-4">
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
				<form.Field
					name="description"
					validators={{
						onSubmit: ({ value }) =>
							!value && (!isBulk || changedFields.current.has("description"))
								? "This field is required"
								: undefined,
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
									onChange={(e) => {
										changedFields.current.add("description");
										field.handleChange(e.target.value);
									}}
									placeholder={
										mixed("description") ? "Multiple values" : undefined
									}
									className="form-input"
								/>
							)}
						</FormInputWrapper>
					)}
				</form.Field>
				<FormInputWrapper
					label={mixed("content") ? "Content (multiple values)" : "Content"}
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
									<TextareaEditor
										value={content}
										onChange={(value) => {
											changedFields.current.add("content");
											setContent(value);
										}}
									/>
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
									onChange={(e) => {
										if (isBulk && e.target.value === "") {
											changedFields.current.delete("hourlyRate");
											field.handleChange(bulkProject?.hourlyRate ?? "");
											return;
										}
										changedFields.current.add("hourlyRate");
										field.handleChange(Number(e.target.value || 0));
									}}
									placeholder={
										mixed("hourlyRate") ? "Multiple values" : undefined
									}
									className="form-input"
								/>
							)}
						</FormInputWrapper>
					)}
				</form.Field>
				<FormInputCombobox
					onChange={(val) => {
						changedFields.current.add("status");
						setStatus(val as ProjectType["status"]);
					}}
					value={status}
					options={statusList}
					placeholder={mixed("status") ? "Multiple values" : undefined}
					label="Status"
					className="w-full"
					loading={isLoading}
				/>
				<div className="flex flex-col gap-1">
					<span className="text-muted-foreground">Clients</span>
					<MultiValueInput
						options={clientsOptions}
						values={projectClients.map((client) => String(client.id)) || []}
						changeBaselineValues={
							isBulk
								? bulkProject?.clients?.map((client) => String(client.id))
								: undefined
						}
						valueCounts={isBulk ? clientCounts : undefined}
						totalValueCount={isBulk ? bulkItems?.length : undefined}
						valueIntents={isBulk ? clientIntents : undefined}
						onValueIntentChange={isBulk ? onClientIntentChange : undefined}
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

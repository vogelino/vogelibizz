import { ArrowLeftToLine, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import {
	type ClientType,
	clientLanguageEnum,
	type ProjectType,
} from "@/db/schema";

type ClientLanguage = ClientType["language"];

const languageLabels: Record<ClientLanguage, string> = {
	"en-US": "English (United States)",
	"es-CL": "Spanish (Chile)",
	"fr-CH": "French (Switzerland)",
	"de-DE": "German (Germany)",
};

export type ClientFilterState = {
	languages: ClientLanguage[];
	projectIds: string[];
};

type ClientFilterProps =
	| {
			loading: true;
			projects: readonly ProjectType[];
			filters?: never;
			onFiltersChange?: never;
	  }
	| {
			loading: false;
			projects: readonly ProjectType[];
			filters: ClientFilterState;
			onFiltersChange: (filters: ClientFilterState) => void;
	  };

function LanguageBadge({ language }: { language: ClientLanguage }) {
	return (
		<IconBadge
			icon={<Languages size={16} />}
			label={languageLabels[language]}
		/>
	);
}

export function ClientFilter(props: ClientFilterProps) {
	const languages = props.loading ? [] : props.filters.languages;
	const projectIds = props.loading ? [] : props.filters.projectIds;
	const hasFilters = languages.length > 0 || projectIds.length > 0;

	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
			<MultiValueInput<ClientLanguage>
				options={clientLanguageEnum.enumValues.map((language) => ({
					value: language,
					label: (
						<>
							<Languages size={16} />
							<span>{languageLabels[language]}</span>
						</>
					),
				}))}
				values={languages}
				placeholder="Filter by language"
				aria-label="Filter clients by language"
				selectedValueFormater={(value) => (
					<LanguageBadge language={value as ClientLanguage} />
				)}
				onChange={
					props.loading
						? undefined
						: (options) =>
								props.onFiltersChange({
									...props.filters,
									languages: options.map(
										(option) => option.value as ClientLanguage,
									),
								})
				}
				loading={props.loading}
				className="min-w-64 max-w-full"
			/>

			<MultiValueInput<string>
				options={props.projects.map((project) => ({
					value: String(project.id),
					label: project.name,
				}))}
				values={projectIds}
				placeholder="Filter by project"
				aria-label="Filter clients by project"
				selectedValueFormater={(value) => (
					<IconBadge
						icon={null}
						label={
							props.projects.find(
								(project) => String(project.id) === String(value),
							)?.name
						}
					/>
				)}
				onChange={
					props.loading
						? undefined
						: (options) =>
								props.onFiltersChange({
									...props.filters,
									projectIds: options.map((option) => String(option.value)),
								})
				}
				loading={props.loading}
				className="min-w-64 max-w-full"
			/>

			{!props.loading && hasFilters ? (
				<Button
					variant="ghost"
					className="h-9"
					onClick={() =>
						props.onFiltersChange({ languages: [], projectIds: [] })
					}
				>
					<ArrowLeftToLine size={20} />
					Clear filters
				</Button>
			) : null}
		</div>
	);
}

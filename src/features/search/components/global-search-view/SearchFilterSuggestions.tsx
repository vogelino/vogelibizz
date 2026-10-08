import { SlidersHorizontal } from "lucide-react";

import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";
import { resourceIconMap } from "@/utility/resourceIcons";

import { type SearchFilterOption, type SearchScopeId, searchScopeLabels } from "../../searchTypes";

type SearchFilterSuggestionsProps = {
  filters: SearchFilterOption[];
  scopes: SearchScopeId[];
  onAddFilter: (filter: SearchFilterOption) => void;
  onSelectScope: (scope: SearchScopeId) => void;
};

export function SearchFilterSuggestions({
  filters,
  scopes,
  onAddFilter,
  onSelectScope,
}: SearchFilterSuggestionsProps) {
  if (filters.length === 0 && scopes.length === 0) return null;
  return (
    <CommandGroup heading="Add a filter or scope">
      {filters.map((filter) => (
        <CommandItem
          key={filter.id}
          value={`filter:${filter.id}`}
          onSelect={() => onAddFilter(filter)}
        >
          <SlidersHorizontal className="text-muted-foreground" />
          <span>{filter.label}</span>
          <CommandShortcut>Add filter</CommandShortcut>
        </CommandItem>
      ))}
      {scopes.map((scope) => {
        const Icon = resourceIconMap[scope];
        return (
          <CommandItem key={scope} value={`scope:${scope}`} onSelect={() => onSelectScope(scope)}>
            <Icon className="size-5 text-muted-foreground" />
            <span>Search in {searchScopeLabels[scope]}</span>
            <CommandShortcut>Set scope</CommandShortcut>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

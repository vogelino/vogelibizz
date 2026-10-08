import { ArrowRight } from "lucide-react";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import { resourceIconMap } from "@/utility/resourceIcons";

import type { GlobalSearchViewModel, SearchResultGroup } from "../../getGlobalSearchView";
import { type SearchDocument, searchScopeLabels } from "../../searchTypes";

type SearchResultGroupsProps = {
  results: GlobalSearchViewModel["results"];
  onOpenDocument: (document: SearchDocument) => void;
};

function getGroups(results: GlobalSearchViewModel["results"]): SearchResultGroup[] {
  return results.status === "ready" || results.status === "pending" ? results.groups : [];
}

export function SearchResultGroups({ results, onOpenDocument }: SearchResultGroupsProps) {
  return getGroups(results).map(({ scope, documents }) => {
    const Icon = resourceIconMap[scope];
    return (
      <CommandGroup key={scope} heading={searchScopeLabels[scope]}>
        {documents.map((document) => (
          <CommandItem
            key={document.id}
            value={document.id}
            onSelect={() => onOpenDocument(document)}
          >
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 grow">
              <span className="block truncate">{document.title}</span>
              {document.subtitle ? (
                <span className="block truncate text-xs text-muted-foreground">
                  {document.subtitle}
                </span>
              ) : null}
            </span>
            <ArrowRight className="shrink-0 text-muted-foreground" />
          </CommandItem>
        ))}
      </CommandGroup>
    );
  });
}

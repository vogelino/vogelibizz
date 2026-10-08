import type { KeyboardEvent } from "react";

import { CommandInput } from "@/components/ui/command";

import type { GlobalSearchViewModel } from "../../getGlobalSearchView";
import { searchScopeLabels } from "../../searchTypes";
import type { GlobalSearchActions } from "../../useGlobalSearch";
import { SearchChip } from "./SearchChip";

type SearchInputProps = {
  view: GlobalSearchViewModel;
  actions: GlobalSearchActions;
};

export function SearchInput({ view, actions }: SearchInputProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace" || view.query.length > 0) return;
    if (view.tokens.length === 0 && !view.scope) return;
    event.preventDefault();
    actions.removeLastConstraint();
  };

  return (
    <CommandInput
      autoFocus
      value={view.query}
      onValueChange={actions.setQuery}
      onKeyDown={onKeyDown}
      placeholder={view.placeholder}
      prefix={
        <div className="flex shrink-0 items-center gap-1">
          {view.scope ? (
            <SearchChip
              label={searchScopeLabels[view.scope]}
              onRemove={() => actions.setScope(null)}
            />
          ) : null}
          {view.tokens.map((token) => (
            <SearchChip
              key={token.id}
              label={token.label}
              onRemove={() => actions.removeToken(token)}
            />
          ))}
        </div>
      }
    />
  );
}

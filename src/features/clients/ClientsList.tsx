"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { ActiveSearchFilter } from "@/components/ActiveSearchFilter";
import PageDataTable from "@/components/PageDataTable";
import { useResourceActions } from "@/components/ResourcePageLayout";
import { useFilterControls } from "@/components/ui/filter-bar";
import type { ClientType } from "@/db/schema";
import { filterRowsByText } from "@/features/search/searchEngine";
import useClientEdit from "@/utility/data/useClientEdit";
import useClients from "@/utility/data/useClients";
import useProjects from "@/utility/data/useProjects";
import { useUrlSearchState } from "@/utility/useUrlSearchState";

import { ClientFilter, type ClientFilterState } from "./ClientFilter";
import { getClientTableColumns } from "./columns";

const clientFilterDefaults: ClientFilterState = {
  languages: [],
  projectIds: [],
};

export default function ClientList({ loading = false }: { loading?: boolean }) {
  const { data = [], error, isPending } = useClients();
  const search = useSearch({ from: "/_resource/clients" });
  const navigate = useNavigate({ from: "/clients" });
  const updateSearch = useCallback(
    (nextSearch: typeof search) => navigate({ search: nextSearch, replace: true }),
    [navigate],
  );
  const [filters, setFilters] = useUrlSearchState(search, clientFilterDefaults, updateSearch);
  const hasActiveFilters =
    filters.languages.length > 0 || filters.projectIds.length > 0 || Boolean(search.q);
  const filterControls = useFilterControls(hasActiveFilters);
  useResourceActions(filterControls.action);
  const { data: projects = [], isPending: projectsPending } = useProjects();
  const editMutation = useClientEdit();
  const isLoading = loading || isPending;
  const editClient = useCallback(
    (client: ClientType, change: Partial<ClientType>) => {
      editMutation.mutate({ id: client.id, ...change });
    },
    [editMutation],
  );
  const columns = useMemo(
    () => getClientTableColumns(editClient, projects, projectsPending),
    [editClient, projects, projectsPending],
  );
  const visibleData = useMemo(
    () =>
      filterRowsByText(
        data,
        search.q,
        (client) => client.id,
        (client) =>
          [
            client.id,
            client.name,
            client.legalName,
            client.clientNumber,
            client.taxId,
            client.projects?.map(({ name }) => name).join(" "),
          ]
            .filter(Boolean)
            .join(" "),
      ),
    [data, search.q],
  );
  const filteredData = useMemo(() => {
    const selectedLanguages = new Set(filters.languages);
    const selectedProjectIds = new Set(filters.projectIds);
    return visibleData.filter(
      (client) =>
        (!selectedLanguages.size || selectedLanguages.has(client.language)) &&
        (!selectedProjectIds.size ||
          client.projects?.some((project) => selectedProjectIds.has(String(project.id)))),
    );
  }, [filters, visibleData]);

  return (
    <PageDataTable<ClientType>
      resource="clients"
      columns={columns}
      data={!error && filteredData.length > 0 ? filteredData : []}
      defaultSortColumn="last_modified"
      loading={isLoading}
      toolbarVisible={filterControls.visible}
      toolbarSkeleton={
        <div className="px-6 pt-3 md:px-10">
          <ClientFilter loading projects={[]} />
        </div>
      }
      toolbar={() => (
        <div className="sticky left-0 flex flex-wrap items-center gap-4 px-6 pt-3 md:px-10">
          <ClientFilter
            loading={false}
            projects={projects}
            filters={filters}
            onFiltersChange={setFilters}
          />
          <ActiveSearchFilter
            query={search.q}
            onClear={() =>
              void navigate({
                search: (previous) => ({ ...previous, q: undefined }),
                replace: true,
              })
            }
          />
        </div>
      )}
    />
  );
}

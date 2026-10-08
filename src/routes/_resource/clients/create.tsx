import { createFileRoute, Outlet, useChildMatches } from "@tanstack/react-router";
import { z } from "zod";

import {
  clientQueryOptions,
  clientsQueryOptions,
  projectsQueryOptions,
} from "@/utility/data/queryOptions";

import { ClientCreateOverlay } from "./create.modal";

export const Route = createFileRoute("/_resource/clients/create")({
  validateSearch: z.object({
    duplicateId: z.coerce.number().pipe(z.int().positive()).optional(),
  }),
  loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
  loader: async ({ context, deps }) => ({
    projects: await context.queryClient.ensureQueryData(projectsQueryOptions()),
    clients: await context.queryClient.ensureQueryData(clientsQueryOptions()),
    duplicate: deps.duplicateId
      ? await context.queryClient.ensureQueryData(clientQueryOptions(deps.duplicateId))
      : undefined,
  }),
  component: ClientCreatePageRoute,
});

function ClientCreatePageRoute() {
  const childMatches = useChildMatches();
  const { duplicate, projects } = Route.useLoaderData();
  if (childMatches.length > 0) return <Outlet />;
  return <ClientCreateOverlay duplicate={duplicate} projects={projects} />;
}

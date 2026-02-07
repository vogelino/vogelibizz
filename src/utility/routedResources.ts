import type { RegisteredRouter } from "@tanstack/react-router";
import type { RoutePaths } from "@tanstack/router-core";
import type { ResourceType } from "@/db/schema";

type AppRoutePaths = RoutePaths<RegisteredRouter["routeTree"]>;
type ResourceRoutePaths = Extract<AppRoutePaths, `/${ResourceType}`>;

export type RoutedResource =
	ResourceRoutePaths extends `/${infer Resource}` ? Resource : never;

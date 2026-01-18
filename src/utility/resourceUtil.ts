import { z } from "zod";
import type { ResourceType } from "@/db/schema";
import type { ActionType } from "@/utility/data/createQueryFunction";

export function singularizeResourceName(resourceName: ResourceType): string {
	if (resourceName.endsWith("ies")) return `${resourceName.slice(0, -3)}y`;
	if (resourceName.endsWith("s")) return resourceName.slice(0, -1);
	return resourceName;
}

export function getQueryCompletionMessage({
	action,
	resourceName,
	data,
	resolution,
	details,
}: {
	action: ActionType;
	resourceName: ResourceType;
	data: { name: string } | { name: string }[] | string | number | unknown;
	resolution: "failure" | "success";
	details?: string;
}) {
	const resolutionPrefix =
		resolution === "success" ? "Successfully" : "Failed to";
	const verb =
		resolution === "success"
			? getVerbByAction(action)
			: getSubstantiveByAction(action);
	const resourceNameInSingular = singularizeResourceName(resourceName);
	const isPlural = Array.isArray(data) && data.length > 1;
	const isSingularWithName =
		Array.isArray(data) &&
		data.length === 1 &&
		data[0] &&
		typeof data[0] === "object" &&
		"name" in data[0];
	const isNamedObject =
		!Array.isArray(data) && data && typeof data === "object" && "name" in data;
	const singleItemSuffix = isSingularWithName
		? `with name '${data[0].name}'`
		: isNamedObject
			? `with name '${data.name}'`
			: `with id '${String(data)}'`;
	const itemPart = isPlural
		? `${data.length} ${resourceName}`
		: `${resourceNameInSingular} ${singleItemSuffix}`;
	const detail = details ? `: ${details}` : "";
	return `${resolutionPrefix} ${verb} ${itemPart}${detail}`;
}

function getVerbByAction(action: ActionType) {
	switch (action) {
		case "create":
			return "created";
		case "edit":
			return "edited";
		case "delete":
			return "deleted";
		default:
			return "queried";
	}
}

function getSubstantiveByAction(action: ActionType) {
	if (action === "queryAll" || action === "querySingle") return "query";
	return action;
}

export function parseId(id: unknown) {
	return z
		.union([z.string(), z.number()], {
			message: `The provided ID is not a valid number or string. Received "${id}"`,
		})
		.transform((id) => Number(id))
		.refine((parsedId) => !Number.isNaN(parsedId), {
			message: `The provided ID is not a valid number or string. Received "${id}"`,
		})
		.parse(id);
}

export function verbToPresentParticiple(verb: string) {
	if (verb.endsWith("e")) return `${verb.slice(0, -1)}ing`;
	return `${verb}ing`;
}

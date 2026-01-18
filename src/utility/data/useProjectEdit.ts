"use client";

import {
	type ProjectEditType,
	type ProjectType,
	projectEditSchema,
	type ResourceType,
} from "@/db/schema";
import { getNowInUTC } from "../timeUtil";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "projects";
const action: ActionType = "edit";
const inputZodSchema = projectEditSchema;

const useProjectEdit = createMutationHook<ProjectType[], ProjectEditType>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void>({
		resourceName,
		action,
		inputZodSchema,
	}),
	createOptimisticDataEntry,
});

export default useProjectEdit;

function createOptimisticDataEntry(
	oldData: ProjectType[] | undefined,
	editedData: ProjectEditType,
): ProjectType[] {
	return (oldData || []).map((c) =>
		c.id === editedData.id
			? { ...c, ...editedData, last_modified: getNowInUTC() }
			: c,
	);
}

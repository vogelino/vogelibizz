import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import ResourceCreateButton from "@/components/ResourceCreateButton";
import type { RoutedResource } from "@/utility/routedResources";

const ResourceActionsContext = createContext<
	((actions: ReactNode | null) => void) | null
>(null);

export function useResourceActions(actions: ReactNode | null) {
	const setActions = useContext(ResourceActionsContext);
	useEffect(() => {
		if (!setActions) return;
		setActions(actions);
		return () => {
			setActions(null);
		};
	}, [actions, setActions]);
}

function ResourcePageLayout({
	resource,
	children,
}: {
	resource: RoutedResource;
	children: ReactNode;
}) {
	const [actions, setActions] = useState<ReactNode | null>(null);

	return (
		<ResourceActionsContext.Provider value={setActions}>
			<div className="px-10 pb-8">
				<div className="flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center">
					<h1 className="text-lg font-semibold uppercase antialiased">
						{resource}
					</h1>
					<div className="flex items-center gap-2">
						{actions}
						<ResourceCreateButton resource={resource} />
					</div>
				</div>
				{children}
			</div>
		</ResourceActionsContext.Provider>
	);
}

export default ResourcePageLayout;

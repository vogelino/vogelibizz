"use client";

import {
	DevtoolsPanel,
	DevtoolsProvider as DevtoolsProviderBase,
} from "@refinedev/devtools";
import type React from "react";

export const DevtoolsProvider = (props: { children: React.ReactNode }) => {
	return (
		<DevtoolsProviderBase>
			{props.children}
			<DevtoolsPanel />
		</DevtoolsProviderBase>
	);
};

import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const startStorageContextClient = fileURLToPath(
	new URL("./src/utility/startStorageContext.client.ts", import.meta.url),
);

export default defineConfig(({ ssrBuild }) => ({
	plugins: [tsconfigPaths(), tanstackStart(), tailwindcss(), react()],
	resolve: ssrBuild
		? undefined
		: {
				alias: {
					"@tanstack/start-storage-context": startStorageContextClient,
				},
			},
	server: {
		host: "127.0.0.1",
		port: 3000,
	},
}));

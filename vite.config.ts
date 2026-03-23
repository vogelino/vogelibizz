import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const startStorageContextClient = fileURLToPath(
	new URL("./src/utility/startStorageContext.client.ts", import.meta.url),
);

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		tanstackStart(),
		tailwindcss(),
		react(),
		{
			name: "start-storage-context-alias",
			resolveId(id, _importer, options) {
				if (id === "@tanstack/start-storage-context" && !options?.ssr) {
					return startStorageContextClient;
				}
			},
		},
	],
	server: {
		host: "127.0.0.1",
		port: 3000,
	},
});

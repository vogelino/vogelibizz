import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
	plugins: [tsconfigPaths(), tanstackStart(), tailwindcss(), react()],
	server: {
		host: "127.0.0.1",
		port: 3000,
	},
});

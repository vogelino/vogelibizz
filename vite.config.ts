import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const startStorageContextClient = fileURLToPath(
  new URL("./src/utility/startStorageContext.client.ts", import.meta.url),
);
const clientDbStub = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "src/utility/db.client.ts",
);

function clientOnlyAliases(): Plugin {
  return {
    name: "client-only-aliases",
    enforce: "pre",
    resolveId(source, _importer, options) {
      if (options.ssr) return null;
      if (source === "@tanstack/start-storage-context") {
        return startStorageContextClient;
      }
      if (source === "@/db") {
        return clientDbStub;
      }
      return null;
    },
  };
}

export default defineConfig(() => ({
  plugins: [
    clientOnlyAliases(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths(),
    tanstackStart(),
    tailwindcss(),
    react(),
  ].filter(Boolean),
  server: {
    port: 3000,
    watch: {
      ignored: ["**/.wrangler/**"],
    },
  },
}));

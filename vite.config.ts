import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function loadDevVars(): Record<string, string> {
	try {
		return Object.fromEntries(
			readFileSync(".dev.vars", "utf-8")
				.split("\n")
				.filter((line) => /^\s*[A-Z_]+=/.test(line))
				.map((line) => {
					const eq = line.indexOf("=");
					const key = line.slice(0, eq).trim();
					const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
					return [key, value];
				}),
		);
	} catch {
		return {};
	}
}

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

export default defineConfig(() => {
  const devVars = loadDevVars();
  const publicDefines = Object.fromEntries(
    Object.entries(devVars)
      .filter(([k]) => k.startsWith("VITE_PUBLIC_"))
      .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)]),
  );

  return {
    define: publicDefines,
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
  };
});

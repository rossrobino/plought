import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			experimental: { remoteFunctions: true },
			compilerOptions: { experimental: { async: true } },
			inspector: true,
		}),
	],
	server: { forwardConsole: true },
	test: { environment: "node", include: ["src/**/*.test.ts"] },
});

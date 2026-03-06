import { defineConfig } from "oxlint";

export default defineConfig({
	rules: { "no-undef": "off" },
	categories: {
		correctness: "warn",
		perf: "warn",
		style: "off",
		nursery: "warn",
	},
});

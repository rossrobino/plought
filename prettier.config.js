/** @import {Config} from "prettier" */

/** @type {Config} */
export default {
	useTabs: true,
	htmlWhitespaceSensitivity: "ignore",
	plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
};

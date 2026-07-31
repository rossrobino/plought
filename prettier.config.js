/** @import {Config} from "prettier" */

/** @type {Config} */
export default {
	useTabs: true,
	htmlWhitespaceSensitivity: "ignore",
	objectWrap: "collapse",
	plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
	tailwindStylesheet: "./src/routes/app.css",
};

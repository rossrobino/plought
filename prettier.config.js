/** @import {Config} from "prettier" */
import config from "@robino/prettier";

/** @type {Config} */
export default {
	...config,
	plugins: [
		...config.plugins,
		"prettier-plugin-svelte",
		"prettier-plugin-tailwindcss",
	],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
	tailwindStylesheet: "./src/routes/app.css",
};

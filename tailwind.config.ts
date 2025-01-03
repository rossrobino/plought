import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				base: {
					DEFAULT: "#FDFDFD",
				},
				content: {
					DEFAULT: "#0D1C3A",
				},
				p: {
					DEFAULT: "#7af066",
					100: "#DEFBEB",
				},
				s: {
					DEFAULT: "#3A637A",
					100: "#D6F4FA",
				},
			},
		},
	},
} satisfies Config;

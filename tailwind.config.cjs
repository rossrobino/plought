const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {
			colors: {
				p: "#30E013",
			},
		},
	},

	plugins: [require("@tailwindcss/typography")],
};

module.exports = config;

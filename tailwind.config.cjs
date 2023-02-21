const config = {
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
					DEFAULT: "#30D015",
					100: "#DEFBEB",
				},
				s: {
					DEFAULT: "#3A637A",
					100: "#D6F4FA",
				},
			},
			fontFamily: {
				archivo: ["Archivo", "sans-serif"],
			},
		},
	},
};

module.exports = config;

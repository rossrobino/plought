import { capitalize } from "$lib/util/capitalize";

export const info = {
	author: { name: "Ross Robino", url: "https://robino.dev" },
	name: "Plought",
	tagline: "Reduce Noise in Decision Making",
	github: "https://github.com/rossrobino/plought",
};

class App {
	path: string;
	desc: string;

	constructor(path: string, desc: string) {
		this.path = path;
		this.desc = desc;
	}

	get title() {
		return this.getTitle();
	}

	getTitle() {
		return capitalize(this.path.replace(/[^A-Z]/gi, " "));
	}
}

export const apps = [
	new App("/weighted-sum", "Evaluate alternatives based on weighted criteria."),
	new App(
		"/pairwise-comparison",
		"Compare alternatives against each possible option.",
	),
];

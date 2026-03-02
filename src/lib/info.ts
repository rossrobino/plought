import { capitalize } from "$lib/util/capitalize";
import type { MethodKey } from "$lib/state";

export const info = {
	author: { name: "Ross Robino", url: "https://robino.dev" },
	name: "Plought",
	tagline: "Reduce Noise in Decision Making",
	github: "https://github.com/rossrobino/plought",
};

class App {
	path: string;
	desc: string;
	method: MethodKey;

	constructor(path: string, desc: string, method: MethodKey) {
		this.path = path;
		this.desc = desc;
		this.method = method;
	}

	get title() {
		return capitalize(this.path.replace(/[^A-Z]/gi, " "));
	}
}

export const apps = [
	new App(
		"/weighted-sum",
		"Evaluate alternatives based on weighted criteria.",
		"weightedSum",
	),
	new App(
		"/pairwise-comparison",
		"Compare alternatives against each possible option.",
		"pairwise",
	),
	new App(
		"/rank-order",
		"Order alternatives from most to least preferred.",
		"rankOrder",
	),
];

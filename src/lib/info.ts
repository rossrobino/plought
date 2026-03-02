import type { MethodKey } from "$lib/state";
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
	method: MethodKey;
	label?: string;

	constructor(path: string, desc: string, method: MethodKey, label?: string) {
		this.path = path;
		this.desc = desc;
		this.method = method;
		this.label = label;
	}

	get title() {
		if (this.label != null) {
			return this.label;
		}
		return capitalize(this.path.replace(/[^A-Z]/gi, " "));
	}
}

export const apps = [
	new App(
		"/weight",
		"Evaluate alternatives based on weighted criteria.",
		"weightedSum",
		"Weight",
	),
	new App(
		"/compare",
		"Compare alternatives against each possible option.",
		"pairwise",
		"Compare",
	),
	new App(
		"/rank",
		"Order alternatives from most to least preferred.",
		"rankOrder",
		"Rank",
	),
];

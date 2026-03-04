import type { MethodKey } from "$lib/state";
import { capitalize } from "$lib/util/capitalize";
import GitCompareIcon from "@lucide/svelte/icons/git-compare";
import ListOrderedIcon from "@lucide/svelte/icons/list-ordered";
import ScaleIcon from "@lucide/svelte/icons/scale";
import { type Component } from "svelte";

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
	icon: Component;
	badge: string;

	constructor(
		path: string,
		desc: string,
		method: MethodKey,
		label: string,
		icon: Component,
		badge: string,
	) {
		this.path = path;
		this.desc = desc;
		this.method = method;
		this.label = label;
		this.icon = icon;
		this.badge = badge;
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
		ScaleIcon,
		"Weighted criteria",
	),
	new App(
		"/compare",
		"Compare alternatives against each possible option.",
		"pairwise",
		"Compare",
		GitCompareIcon,
		"Head-to-head",
	),
	new App(
		"/rank",
		"Order alternatives from most to least preferred.",
		"rankOrder",
		"Rank",
		ListOrderedIcon,
		"Manual ranking",
	),
];

import type { AppKey, MethodKey } from "$lib/state";
import { capitalize } from "$lib/util/capitalize";
import GitCompareIcon from "@lucide/svelte/icons/git-compare";
import HandCoinsIcon from "@lucide/svelte/icons/hand-coins";
import ListOrderedIcon from "@lucide/svelte/icons/list-ordered";
import ScaleIcon from "@lucide/svelte/icons/scale";
import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
import { type Component } from "svelte";

export const info = {
	author: { name: "Ross Robino", url: "https://robino.dev" },
	name: "Plought",
	tagline: "Reduce noise in decision making",
	url: "https://plought.vercel.app",
	github: "https://github.com/rossrobino/plought",
};

class App {
	key: AppKey;
	path: string;
	desc: string;
	method: MethodKey;
	label?: string;
	icon: Component;
	badge: string;

	constructor(
		key: AppKey,
		path: string,
		desc: string,
		method: MethodKey,
		label: string,
		icon: Component,
		badge: string,
	) {
		this.key = key;
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
		"weigh",
		"/weigh",
		"Set how important each criterion is.",
		"weightedSum",
		"Weigh",
		ScaleIcon,
		"Weighted criteria",
	),
	new App(
		"score",
		"/score",
		"Score each alternative against each criterion.",
		"weightedSum",
		"Score",
		SlidersHorizontalIcon,
		"Alternative scoring",
	),
	new App(
		"compare",
		"/compare",
		"Compare alternatives against each possible option.",
		"pairwise",
		"Compare",
		GitCompareIcon,
		"Head-to-head",
	),
	new App(
		"rank",
		"/rank",
		"Order alternatives from most to least preferred.",
		"rankOrder",
		"Rank",
		ListOrderedIcon,
		"Manual ranking",
	),
	new App(
		"allocate",
		"/allocate",
		"Distribute points across alternatives for each criterion.",
		"allocate",
		"Allocate",
		HandCoinsIcon,
		"Point allocation",
	),
];

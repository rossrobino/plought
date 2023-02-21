import type { LayoutServerLoad } from "./$types";
import { dev } from "$app/environment";

export const load: LayoutServerLoad = async () => {
	return { contributors: fetchContributors() };
};

const fetchContributors = async () => {
	try {
		// if (!dev) -- for testing, github api rate limit
		if (!dev) {
			const res = await fetch(
				"https://api.github.com/repos/rossrobino/plought/contributors",
			);
			const contributors = await res.json();
			if (contributors[0]?.login) return contributors;
		}
		return [];
	} catch (error) {
		console.log(error);
		return [];
	}
};

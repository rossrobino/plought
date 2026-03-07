import { apps } from "$lib/info";

type ChangeFreq = "daily" | "weekly" | "monthly";

interface SeoMeta {
	title: string;
	desc: string;
	changefreq?: ChangeFreq;
	priority?: number;
}

const appSeo = Object.fromEntries(
	apps.map((item) => {
		return [
			item.path,
			{
				title: item.title,
				desc: item.desc,
				changefreq: "weekly",
				priority: 0.8,
			} satisfies SeoMeta,
		];
	}),
) as Record<string, SeoMeta>;

export const seoByPath: Record<string, SeoMeta> = {
	"/": {
		title: "",
		desc: "Reduce noise in decision making by structuring setup, scoring, and comparison in one workflow.",
		changefreq: "weekly",
		priority: 1,
	},
	"/setup": {
		title: "Start",
		desc: "Set your decision title and goal so every criterion and comparison stays aligned.",
		changefreq: "weekly",
		priority: 0.9,
	},
	"/setup/alternatives": {
		title: "Alternatives",
		desc: "Add and refine alternatives before running scoring and comparison methods.",
		changefreq: "weekly",
		priority: 0.9,
	},
	"/setup/criteria": {
		title: "Criteria",
		desc: "Define the criteria used to evaluate alternatives consistently across methods.",
		changefreq: "weekly",
		priority: 0.9,
	},
	...appSeo,
	"/analysis": {
		title: "Summary",
		desc: "Compare included methods side by side and review consensus guidance before deciding.",
		changefreq: "weekly",
		priority: 0.9,
	},
	"/analysis/weight": {
		title: "Weighted Sum",
		desc: "Review weighted totals and criterion contribution breakdown for each alternative.",
		changefreq: "weekly",
		priority: 0.8,
	},
	"/analysis/compare": {
		title: "Pairwise Comparison",
		desc: "Inspect pairwise outcomes and normalized totals across all alternatives.",
		changefreq: "weekly",
		priority: 0.8,
	},
	"/analysis/rank": {
		title: "Rank Order",
		desc: "See ordinal rankings converted to a 0 to 10 scale for comparison.",
		changefreq: "weekly",
		priority: 0.8,
	},
	"/analysis/allocate": {
		title: "Point Allocation",
		desc: "Analyze weighted results from per-criterion point allocations.",
		changefreq: "weekly",
		priority: 0.8,
	},
	"/analysis/topsis": {
		title: "TOPSIS",
		desc: "Evaluate alternatives by distance to ideal and anti-ideal profiles.",
		changefreq: "weekly",
		priority: 0.8,
	},
	"/analysis/robustness": {
		title: "Robustness",
		desc: "Test recommendation stability under simulated weight variation.",
		changefreq: "weekly",
		priority: 0.8,
	},
};

const normalizePath = (path: string) => {
	if (path.length > 1 && path.endsWith("/")) {
		return path.slice(0, -1);
	}
	return path;
};

export const getSeo = (path: string) => {
	const key = normalizePath(path);
	return seoByPath[key] ?? null;
};

export const seoPaths = Object.keys(seoByPath).sort();

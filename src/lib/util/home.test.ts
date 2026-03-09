import { decisionDefaults } from "$lib/state";
import type { Alternative, Criteria, Decision } from "$lib/types";
import {
	type HomeAppState,
	type HomeSetupState,
	getHomeNextStep,
	getHomePreview,
} from "$lib/util/home";
import { describe, expect, it } from "vitest";

const decision: Decision = { ...decisionDefaults };
const criteria: Criteria[] = [
	{ name: "Cost", weight: 0.7 },
	{ name: "Speed", weight: 0.3 },
];
const alternatives: Alternative[] = [
	{ name: "A", scores: [10, 5], pairwise: [0.5, 0.8, 0.6] },
	{ name: "B", scores: [8, 6], pairwise: [0.2, 0.5, 0.4] },
	{ name: "C", scores: [4, 9], pairwise: [0.4, 0.6, 0.5] },
];
const allocation = [
	[70, 20, 10],
	[20, 30, 50],
];

const getSetupUsed = (
	overrides: Partial<HomeSetupState> = {},
): HomeSetupState => {
	return { start: false, alternatives: false, criteria: false, ...overrides };
};

const getAppUsed = (overrides: Partial<HomeAppState> = {}): HomeAppState => {
	return {
		weigh: false,
		score: false,
		compare: false,
		allocate: false,
		...overrides,
	};
};

describe("home utilities", () => {
	it("starts setup when no setup steps are used", () => {
		expect(getHomeNextStep(getSetupUsed(), getAppUsed())).toMatchObject({
			href: "/setup",
			label: "Start setup",
		});
	});

	it("routes to alternatives before criteria", () => {
		expect(
			getHomeNextStep(getSetupUsed({ start: true }), getAppUsed()),
		).toMatchObject({
			href: "/setup/alternatives",
			label: "Continue with alternatives",
		});
	});

	it("routes to weigh after setup is complete", () => {
		expect(
			getHomeNextStep(
				getSetupUsed({ start: true, alternatives: true, criteria: true }),
				getAppUsed(),
			),
		).toMatchObject({ href: "/weigh", label: "Resume weighing" });
	});

	it("routes to the first unused app after partial analysis work", () => {
		expect(
			getHomeNextStep(
				getSetupUsed({ start: true, alternatives: true, criteria: true }),
				getAppUsed({ weigh: true, score: true }),
			),
		).toMatchObject({ href: "/compare", label: "Resume comparisons" });
	});

	it("falls back to summary when every tracked step is used", () => {
		expect(
			getHomeNextStep(
				getSetupUsed({ start: true, alternatives: true, criteria: true }),
				getAppUsed({ weigh: true, score: true, compare: true, allocate: true }),
			),
		).toMatchObject({ href: "/analysis", label: "Review summary" });
	});

	it("omits the leader when inputs are insufficient", () => {
		const preview = getHomePreview({
			decision,
			criteria: [],
			alternatives: [{ name: "A", scores: [], pairwise: [0.5] }],
			allocation: [],
			setupUsed: getSetupUsed(),
			appUsed: getAppUsed(),
			includedMethods: [],
		});

		expect(preview.leaderName).toBeNull();
		expect(preview.leaderScore).toBeNull();
		expect(preview.leaderSource).toBeNull();
	});

	it("uses consensus when methods are included", () => {
		const preview = getHomePreview({
			decision,
			criteria,
			alternatives,
			allocation,
			setupUsed: getSetupUsed({
				start: true,
				alternatives: true,
				criteria: true,
			}),
			appUsed: getAppUsed({ weigh: true, score: true }),
			includedMethods: ["weightedSum", "pairwise"],
		});

		expect(preview.leaderName).toBe("A");
		expect(preview.leaderSource).toBe("Consensus preview");
		expect(preview.agreementLabel).toBe("High");
		expect(preview.leaderScore).toBeGreaterThan(0);
	});

	it("falls back to weighted sum when no methods are included", () => {
		const preview = getHomePreview({
			decision,
			criteria,
			alternatives,
			allocation,
			setupUsed: getSetupUsed({ start: true }),
			appUsed: getAppUsed(),
			includedMethods: [],
		});

		expect(preview.leaderName).toBe("A");
		expect(preview.leaderSource).toBe("Weighted Sum preview");
		expect(preview.agreementLabel).toBeNull();
		expect(preview.leaderScore).toBeGreaterThan(0);
	});
});

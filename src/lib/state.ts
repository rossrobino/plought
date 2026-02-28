import type { Alternative, Criteria, Decision } from "$lib/types";
import { PersistedState } from "runed";

const getCriteria = (): Criteria[] => [
	{ name: "Criteria #1", weight: 0.5 },
	{ name: "Criteria #2", weight: 0.5 },
];

const getAlternatives = (): Alternative[] => [
	{ name: "Alternative #1", scores: [5, 5], pairwise: [0.5, 0.5] },
	{ name: "Alternative #2", scores: [5, 5], pairwise: [0.5, 0.5] },
];

export const decisionDefaults: Decision = {
	title: "My Decision",
	goal: "Choose the best option based on my priorities.",
};

const getDecision = (): Decision => {
	return {
		...decisionDefaults,
	};
};

export const criteria = new PersistedState("criteria", getCriteria());
export const alternatives = new PersistedState(
	"alternatives",
	getAlternatives(),
);
export const decision = new PersistedState("decision", getDecision());

export const reset = () => {
	criteria.current = getCriteria();
	alternatives.current = getAlternatives();
	decision.current = getDecision();
};

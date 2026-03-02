import type { Alternative, Criteria, Decision } from "$lib/types";
import { PersistedState } from "runed";

export type MethodKey = "weightedSum" | "pairwise" | "rankOrder";

export interface MethodMeta {
	included: boolean;
	used: boolean;
}

export type MethodMetaState = Record<MethodKey, MethodMeta>;

const getCriteria = (): Criteria[] => [
	{ name: "Criteria #1", weight: 0.5 },
	{ name: "Criteria #2", weight: 0.5 },
];

const getAlternatives = (): Alternative[] => [
	{ name: "Alternative #1", scores: [5, 5], pairwise: [0.5, 0.5] },
	{ name: "Alternative #2", scores: [5, 5], pairwise: [0.5, 0.5] },
];

const getRankOrder = (count: number) => {
	return Array.from({ length: count }, (_, i) => i);
};

const getMethodMetaDefaults = (
	used = false,
	included = false,
): MethodMetaState => {
	return {
		weightedSum: { used, included },
		pairwise: { used, included },
		rankOrder: { used, included },
	};
};

const getMethodMeta = (): MethodMetaState => {
	const defaults = getMethodMetaDefaults();
	if (typeof window === "undefined") {
		return defaults;
	}
	try {
		const storage = window.localStorage;
		if (storage.getItem("methodMeta") != null) {
			return defaults;
		}
		const hasLegacyData = ["criteria", "alternatives", "decision", "rankOrder"]
			.some((key) => storage.getItem(key) != null);
		if (hasLegacyData) {
			return getMethodMetaDefaults(true, true);
		}
		return defaults;
	} catch {
		return defaults;
	}
};

export const decisionDefaults: Decision = {
	title: "My Decision",
	goal: "Choose the best option based on my priorities.",
};

const getDecision = (): Decision => {
	return { ...decisionDefaults };
};

export const normalizeRankOrder = (order: number[], count: number) => {
	const next = [];
	const seen = new Set<number>();

	for (const id of order) {
		if (!Number.isInteger(id) || id < 0 || id >= count || seen.has(id)) {
			continue;
		}
		seen.add(id);
		next.push(id);
	}

	for (let i = 0; i < count; i++) {
		if (!seen.has(i)) {
			next.push(i);
		}
	}

	return next;
};

export const getRankScore = (rank: number, count: number) => {
	if (count <= 1) {
		return 10;
	}
	return Number((((count - 1 - rank) / (count - 1)) * 10).toFixed(2));
};

export const methodMeta = new PersistedState("methodMeta", getMethodMeta());
export const criteria = new PersistedState("criteria", getCriteria());
export const alternatives = new PersistedState(
	"alternatives",
	getAlternatives(),
);
export const decision = new PersistedState("decision", getDecision());
export const rankOrder = new PersistedState(
	"rankOrder",
	getRankOrder(getAlternatives().length),
);

export const syncRankOrder = (count = alternatives.current.length) => {
	const order = Array.isArray(rankOrder.current) ? rankOrder.current : [];
	const next = normalizeRankOrder(order, count);
	const current = Array.isArray(rankOrder.current) ? rankOrder.current : [];
	if (
		next.length !== current.length ||
		next.some((id, i) => id !== current[i])
	) {
		rankOrder.current = next;
	}
	return next;
};

export const markMethodUsed = (method: MethodKey) => {
	const item = methodMeta.current[method];
	if (item == null || item.used) {
		return;
	}
	item.used = true;
	item.included = true;
};

export const setMethodIncluded = (method: MethodKey, included: boolean) => {
	const item = methodMeta.current[method];
	if (item == null) {
		return;
	}
	item.included = included;
};

export const toggleMethodIncluded = (method: MethodKey) => {
	setMethodIncluded(method, !isMethodIncluded(method));
};

export const isMethodUsed = (method: MethodKey) => {
	return methodMeta.current[method]?.used ?? false;
};

export const isMethodIncluded = (method: MethodKey) => {
	return methodMeta.current[method]?.included ?? false;
};

export const reset = () => {
	criteria.current = getCriteria();
	alternatives.current = getAlternatives();
	decision.current = getDecision();
	rankOrder.current = getRankOrder(getAlternatives().length);
	methodMeta.current = getMethodMetaDefaults();
};

import type { Alternative, Criteria, Decision } from "$lib/types";
import { PersistedState } from "runed";

const methodKeys = ["weightedSum", "pairwise", "rankOrder", "topsis"] as const;

export type MethodKey = (typeof methodKeys)[number];

export interface MethodMeta {
	included: boolean;
	used: boolean;
}

export type MethodMetaState = Record<MethodKey, MethodMeta>;

const getCriteria = (): Criteria[] => [
	{ name: "Criterion #1", weight: 0.5 },
	{ name: "Criterion #2", weight: 0.5 },
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
		topsis: { used, included },
	};
};

const normalizeMethodMeta = (
	value: Partial<MethodMetaState> | null | undefined,
	used = false,
	included = false,
) => {
	const defaults = getMethodMetaDefaults(used, included);
	if (value == null || typeof value !== "object") {
		return defaults;
	}
	const next = {} as MethodMetaState;
	for (const key of methodKeys) {
		const item = value[key];
		next[key] = {
			used: item?.used ?? defaults[key].used,
			included: item?.included ?? defaults[key].included,
		};
	}
	return next;
};

const getMethodMeta = (): MethodMetaState => {
	const defaults = getMethodMetaDefaults();
	if (typeof window === "undefined") {
		return defaults;
	}
	try {
		const storage = window.localStorage;
		const current = storage.getItem("methodMeta");
		if (current != null) {
			try {
				return normalizeMethodMeta(
					JSON.parse(current) as Partial<MethodMetaState>,
				);
			} catch {
				return defaults;
			}
		}
		const hasLegacyData = [
			"criteria",
			"alternatives",
			"decision",
			"rankOrder",
		].some((key) => storage.getItem(key) != null);
		if (hasLegacyData) {
			return normalizeMethodMeta(undefined, true, true);
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

const syncMethodMeta = () => {
	const current = methodMeta.current;
	const next = normalizeMethodMeta(current);
	for (const key of methodKeys) {
		if (
			current[key]?.used !== next[key].used ||
			current[key]?.included !== next[key].included
		) {
			methodMeta.current = next;
			return next;
		}
	}
	return current;
};

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
	const item = syncMethodMeta()[method];
	if (item == null || item.used) {
		return;
	}
	item.used = true;
	item.included = true;
};

export const setMethodIncluded = (method: MethodKey, included: boolean) => {
	const item = syncMethodMeta()[method];
	if (item == null) {
		return;
	}
	item.included = included;
};

export const toggleMethodIncluded = (method: MethodKey) => {
	setMethodIncluded(method, !isMethodIncluded(method));
};

export const isMethodUsed = (method: MethodKey) => {
	return syncMethodMeta()[method]?.used ?? false;
};

export const isMethodIncluded = (method: MethodKey) => {
	return syncMethodMeta()[method]?.included ?? false;
};

export const reset = () => {
	criteria.current = getCriteria();
	alternatives.current = getAlternatives();
	decision.current = getDecision();
	rankOrder.current = getRankOrder(getAlternatives().length);
	methodMeta.current = getMethodMetaDefaults();
};

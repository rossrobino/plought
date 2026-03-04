import type { Alternative, Criteria, Decision } from "$lib/types";
import { normalizeAllocation } from "$lib/util/allocate";
import { PersistedState } from "runed";

const methodKeys = [
	"weightedSum",
	"pairwise",
	"rankOrder",
	"topsis",
	"allocate",
] as const;
const setupStepKeys = ["start", "alternatives", "criteria"] as const;

export type MethodKey = (typeof methodKeys)[number];
export type SetupStepKey = (typeof setupStepKeys)[number];

interface MethodMeta {
	included: boolean;
	used: boolean;
}

interface SetupStepMeta {
	used: boolean;
}

type MethodMetaState = Record<MethodKey, MethodMeta>;
type SetupStepMetaState = Record<SetupStepKey, SetupStepMeta>;
type MethodMetaInput = Partial<Record<MethodKey, Partial<MethodMeta>>>;
type SetupStepMetaInput = Partial<Record<SetupStepKey, Partial<SetupStepMeta>>>;

export interface SnapshotState {
	decision: Decision;
	criteria: Criteria[];
	alternatives: Alternative[];
	allocation: number[][];
	rankOrder: number[];
	methodMeta: Record<MethodKey, MethodMeta>;
	setupStepMeta: Record<SetupStepKey, SetupStepMeta>;
}

export interface SnapshotImportState {
	decision?: Partial<Decision>;
	criteria?: Criteria[];
	alternatives?: Alternative[];
	allocation?: number[][];
	rankOrder?: number[];
	methodMeta?: MethodMetaInput;
	setupStepMeta?: SetupStepMetaInput;
}

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

const getAllocation = (criteriaCount: number, alternativeCount: number) => {
	return normalizeAllocation(undefined, criteriaCount, alternativeCount);
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
		allocate: { used, included },
	};
};

const getSetupStepMetaDefaults = (used = false): SetupStepMetaState => {
	return { start: { used }, alternatives: { used }, criteria: { used } };
};

const normalizeMethodMeta = (
	value: MethodMetaInput | null | undefined,
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

const normalizeSetupStepMeta = (
	value: SetupStepMetaInput | null | undefined,
	used = false,
) => {
	const defaults = getSetupStepMetaDefaults(used);
	if (value == null || typeof value !== "object") {
		return defaults;
	}
	const next = {} as SetupStepMetaState;
	for (const key of setupStepKeys) {
		const item = value[key];
		next[key] = { used: item?.used ?? defaults[key].used };
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
				return normalizeMethodMeta(JSON.parse(current) as MethodMetaInput);
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
			return {
				...normalizeMethodMeta(undefined, true, true),
				allocate: { used: false, included: false },
			};
		}
		return defaults;
	} catch {
		return defaults;
	}
};

const getSetupStepMeta = (): SetupStepMetaState => {
	const defaults = getSetupStepMetaDefaults();
	if (typeof window === "undefined") {
		return defaults;
	}
	try {
		const storage = window.localStorage;
		const current = storage.getItem("setupStepMeta");
		if (current != null) {
			try {
				return normalizeSetupStepMeta(
					JSON.parse(current) as SetupStepMetaInput,
				);
			} catch {
				return defaults;
			}
		}
		return defaults;
	} catch {
		return defaults;
	}
};

const getAllocationState = () => {
	const criteriaDefaults = getCriteria();
	const alternativesDefaults = getAlternatives();
	const defaults = getAllocation(
		criteriaDefaults.length,
		alternativesDefaults.length,
	);
	if (typeof window === "undefined") {
		return defaults;
	}
	try {
		const storage = window.localStorage;
		const current = storage.getItem("allocation");
		if (current != null) {
			try {
				return normalizeAllocation(
					JSON.parse(current) as number[][],
					criteriaDefaults.length,
					alternativesDefaults.length,
				);
			} catch {
				return defaults;
			}
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

const cloneCriteria = (value: Criteria[]) => {
	return value.map((item) => {
		return { name: item.name, weight: item.weight };
	});
};

const cloneAlternatives = (value: Alternative[]) => {
	return value.map((item) => {
		return {
			name: item.name,
			scores: [...item.scores],
			pairwise: [...item.pairwise],
		};
	});
};

const cloneAllocation = (value: number[][]) => {
	return value.map((row) => [...row]);
};

const cloneMethodMeta = (value: MethodMetaState) => {
	return methodKeys.reduce((next, key) => {
		next[key] = { used: value[key].used, included: value[key].included };
		return next;
	}, {} as MethodMetaState);
};

const cloneSetupStepMeta = (value: SetupStepMetaState) => {
	return setupStepKeys.reduce((next, key) => {
		next[key] = { used: value[key].used };
		return next;
	}, {} as SetupStepMetaState);
};

const getDefaultAlternatives = (count: number, criteriaCount: number) => {
	const safeCount = Math.max(1, count);
	return Array.from({ length: safeCount }, (_, i) => {
		return {
			name: `Alternative #${i + 1}`,
			scores: new Array(criteriaCount).fill(5),
			pairwise: new Array(safeCount).fill(0.5),
		} satisfies Alternative;
	});
};

const normalizeDecisionState = (
	value: Partial<Decision> | null | undefined,
	fallback: Decision,
) => {
	if (value == null || typeof value !== "object" || Array.isArray(value)) {
		return { ...fallback };
	}
	return {
		title: typeof value.title === "string" ? value.title : fallback.title,
		goal: typeof value.goal === "string" ? value.goal : fallback.goal,
	};
};

const normalizeCriteriaState = (
	value: Criteria[] | null | undefined,
	fallback: Criteria[],
) => {
	const source = Array.isArray(value) && value.length > 0 ? value : fallback;
	return source.map((item, i) => {
		const fallbackItem = fallback[i] ?? {
			name: `Criterion #${i + 1}`,
			weight: 0,
		};
		const name =
			typeof item?.name === "string" && item.name.trim().length > 0
				? item.name
				: fallbackItem.name;
		const weight = Number(item?.weight);
		return {
			name,
			weight: Number.isFinite(weight)
				? Math.max(0, Math.min(1, weight))
				: fallbackItem.weight,
		};
	});
};

const toPairwiseValue = (value: unknown) => {
	const current = Number(value);
	if (!Number.isFinite(current)) {
		return null;
	}
	if (current >= 0.75) {
		return 1;
	}
	if (current <= 0.25) {
		return 0;
	}
	return 0.5;
};

const invertPairwise = (value: number) => {
	if (value === 1) {
		return 0;
	}
	if (value === 0) {
		return 1;
	}
	return 0.5;
};

const normalizeAlternativesState = (
	value: Alternative[] | null | undefined,
	criteriaCount: number,
	fallbackCount: number,
) => {
	const source =
		Array.isArray(value) && value.length > 0
			? value
			: getDefaultAlternatives(fallbackCount, criteriaCount);
	const count = source.length;
	const defaults = getDefaultAlternatives(count, criteriaCount);
	const next = source.map((item, i) => {
		const fallback = defaults[i];
		const name =
			typeof item?.name === "string" && item.name.trim().length > 0
				? item.name
				: fallback.name;
		const scoreSource = Array.isArray(item?.scores)
			? item.scores
			: fallback.scores;
		const scores = Array.from({ length: criteriaCount }, (_, j) => {
			const current = Number(scoreSource[j]);
			return Number.isFinite(current)
				? Math.max(0, Math.min(10, current))
				: fallback.scores[j];
		});
		return {
			name,
			scores,
			pairwise: new Array(count).fill(0.5),
		} satisfies Alternative;
	});

	for (let i = 0; i < count; i++) {
		next[i].pairwise[i] = 0.5;
		for (let j = i + 1; j < count; j++) {
			const direct = toPairwiseValue(source[i]?.pairwise?.[j]);
			const inverse = toPairwiseValue(source[j]?.pairwise?.[i]);
			const value = direct ?? (inverse == null ? 0.5 : invertPairwise(inverse));
			next[i].pairwise[j] = value;
			next[j].pairwise[i] = invertPairwise(value);
		}
	}

	return next;
};

const applyArray = <T>(target: T[], next: T[]) => {
	target.splice(0, target.length, ...next);
};

const applyDecision = (next: Decision) => {
	const current = decision.current;
	current.title = next.title;
	current.goal = next.goal;
};

const applyMethodMeta = (next: MethodMetaState) => {
	const current = methodMeta.current as MethodMetaInput;
	for (const key of methodKeys) {
		const item = current[key];
		if (item == null || typeof item !== "object") {
			current[key] = { used: next[key].used, included: next[key].included };
			continue;
		}
		item.used = next[key].used;
		item.included = next[key].included;
	}
};

const applySetupStepMeta = (next: SetupStepMetaState) => {
	const current = setupStepMeta.current as SetupStepMetaInput;
	for (const key of setupStepKeys) {
		const item = current[key];
		if (item == null || typeof item !== "object") {
			current[key] = { used: next[key].used };
			continue;
		}
		item.used = next[key].used;
	}
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

const methodMeta = new PersistedState("methodMeta", getMethodMeta());
const setupStepMeta = new PersistedState("setupStepMeta", getSetupStepMeta());
export const criteria = new PersistedState("criteria", getCriteria());
export const alternatives = new PersistedState(
	"alternatives",
	getAlternatives(),
);
export const allocation = new PersistedState(
	"allocation",
	getAllocationState(),
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
			applyMethodMeta(next);
			return methodMeta.current;
		}
	}
	return current;
};

const syncSetupStepMeta = () => {
	const current = setupStepMeta.current;
	const next = normalizeSetupStepMeta(current);
	for (const key of setupStepKeys) {
		if (current[key]?.used !== next[key].used) {
			applySetupStepMeta(next);
			return setupStepMeta.current;
		}
	}
	return current;
};

export const syncAllocation = (
	criteriaCount = criteria.current.length,
	alternativeCount = alternatives.current.length,
) => {
	const current = Array.isArray(allocation.current) ? allocation.current : [];
	const next = normalizeAllocation(current, criteriaCount, alternativeCount);
	const equal = (a: number, b: number) => {
		return Math.abs(a - b) < 0.000001;
	};
	const changed =
		current.length !== next.length ||
		next.some((row, i) => {
			const currentRow = current[i] ?? [];
			return (
				currentRow.length !== row.length ||
				row.some((value, j) => !equal(currentRow[j] ?? 0, value))
			);
		});
	if (changed) {
		applyArray(allocation.current, next);
		return next;
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
		applyArray(rankOrder.current, next);
	}
	return next;
};

export const exportSnapshotState = (): SnapshotState => {
	const currentCriteria = cloneCriteria(criteria.current);
	const currentAlternatives = cloneAlternatives(alternatives.current);
	const currentDecision = normalizeDecisionState(
		decision.current,
		getDecision(),
	);
	const currentRankOrder = normalizeRankOrder(
		Array.isArray(rankOrder.current) ? rankOrder.current : [],
		currentAlternatives.length,
	);
	const currentAllocation = normalizeAllocation(
		Array.isArray(allocation.current) ? allocation.current : [],
		currentCriteria.length,
		currentAlternatives.length,
	);
	const currentMethodMeta = normalizeMethodMeta(methodMeta.current);
	const currentSetupStepMeta = normalizeSetupStepMeta(setupStepMeta.current);

	return {
		decision: currentDecision,
		criteria: currentCriteria,
		alternatives: currentAlternatives,
		allocation: cloneAllocation(currentAllocation),
		rankOrder: [...currentRankOrder],
		methodMeta: cloneMethodMeta(currentMethodMeta),
		setupStepMeta: cloneSetupStepMeta(currentSetupStepMeta),
	};
};

export const importSnapshotState = (value: SnapshotImportState) => {
	const decisionDefaultsValue = getDecision();
	const criteriaDefaultsValue = getCriteria();
	const setupDefaults = getSetupStepMetaDefaults();
	const methodDefaults = getMethodMetaDefaults();
	const normalizedDecision = normalizeDecisionState(
		value.decision,
		decisionDefaultsValue,
	);
	const normalizedCriteria = normalizeCriteriaState(
		value.criteria,
		criteriaDefaultsValue,
	);
	const normalizedAlternatives = normalizeAlternativesState(
		value.alternatives,
		normalizedCriteria.length,
		getAlternatives().length,
	);
	const normalizedAllocation = normalizeAllocation(
		Array.isArray(value.allocation) ? value.allocation : undefined,
		normalizedCriteria.length,
		normalizedAlternatives.length,
	);
	const normalizedRankOrder = normalizeRankOrder(
		Array.isArray(value.rankOrder) ? value.rankOrder : getRankOrder(0),
		normalizedAlternatives.length,
	);
	const normalizedMethodMeta = normalizeMethodMeta(
		value.methodMeta,
		methodDefaults.weightedSum.used,
		methodDefaults.weightedSum.included,
	);
	const normalizedSetupMeta = normalizeSetupStepMeta(
		value.setupStepMeta,
		setupDefaults.start.used,
	);

	applyDecision(normalizedDecision);
	applyArray(criteria.current, normalizedCriteria);
	applyArray(alternatives.current, normalizedAlternatives);
	applyArray(allocation.current, normalizedAllocation);
	applyArray(rankOrder.current, normalizedRankOrder);
	applyMethodMeta(normalizedMethodMeta);
	applySetupStepMeta(normalizedSetupMeta);
};

export const markMethodUsed = (method: MethodKey) => {
	const item = syncMethodMeta()[method];
	if (item == null || item.used) {
		return;
	}
	item.used = true;
	item.included = true;
};

export const markSetupStepUsed = (step: SetupStepKey) => {
	const item = syncSetupStepMeta()[step];
	if (item == null || item.used) {
		return;
	}
	item.used = true;
};

const setMethodIncluded = (method: MethodKey, included: boolean) => {
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

export const isSetupStepUsed = (step: SetupStepKey) => {
	return syncSetupStepMeta()[step]?.used ?? false;
};

export const reset = () => {
	const nextCriteria = getCriteria();
	const nextAlternatives = getAlternatives();
	applyArray(criteria.current, nextCriteria);
	applyArray(alternatives.current, nextAlternatives);
	applyArray(
		allocation.current,
		getAllocation(nextCriteria.length, nextAlternatives.length),
	);
	applyDecision(getDecision());
	applyArray(rankOrder.current, getRankOrder(nextAlternatives.length));
	applyMethodMeta(getMethodMetaDefaults());
	applySetupStepMeta(getSetupStepMetaDefaults());
};

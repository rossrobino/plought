import { type MethodKey, getRankScore, normalizeRankOrder } from "$lib/state";
import type { Alternative, Criteria } from "$lib/types";
import { getTopsisCloseness } from "$lib/util/topsis";

type MethodScoreMap = Record<MethodKey, number[]>;

interface MethodScores {
	raw: MethodScoreMap;
	normalized10: MethodScoreMap;
}

interface ConsensusRank {
	meanRank: number[];
	winnerIndex: number | null;
	runnerUpIndex: number | null;
	runnerUpGap: number;
	order: number[];
}

interface GuidanceCopy {
	summary: string;
	comparison: string;
	caveat: string;
}

const round = (value: number) => {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Number(value.toFixed(2));
};

const getWeightedScores = (
	alternatives: Alternative[],
	criteria: Criteria[],
) => {
	return alternatives.map((alt) => {
		let total = 0;
		for (let i = 0; i < criteria.length; i++) {
			total += (criteria[i]?.weight ?? 0) * (alt.scores[i] ?? 0);
		}
		return round(total);
	});
};

const getPairwiseScores = (alternatives: Alternative[]) => {
	return alternatives.map((alt, skip) => {
		let total = 0;
		alt.pairwise.forEach((value, i) => {
			if (i !== skip) {
				total += value;
			}
		});
		return round(total);
	});
};

const getRankScores = (alternatives: Alternative[], order: number[]) => {
	const normalized = normalizeRankOrder(order, alternatives.length);
	const byIndex = new Map<number, number>();
	normalized.forEach((altIndex, i) => {
		byIndex.set(altIndex, i);
	});
	return alternatives.map((_, i) => {
		const rank = byIndex.get(i) ?? alternatives.length - 1;
		return round(getRankScore(rank, alternatives.length));
	});
};

const normalizeWeighted10 = (scores: number[], criteria: Criteria[]) => {
	const denominator =
		criteria.reduce((total, item) => total + (item.weight ?? 0), 0) * 10;
	if (denominator <= 0) {
		return scores.map(() => 0);
	}
	return scores.map((value) => round((value / denominator) * 10));
};

const normalizePairwise10 = (scores: number[], count: number) => {
	const denominator = count - 1;
	if (denominator <= 0) {
		return scores.map(() => 10);
	}
	return scores.map((value) => round((value / denominator) * 10));
};

const rankWithTies = (scores: number[]) => {
	const sorted = scores
		.map((value, i) => ({ value, i }))
		.sort((a, b) => b.value - a.value);
	const ranks = new Array(scores.length).fill(0);

	let i = 0;
	while (i < sorted.length) {
		let j = i;
		while (j + 1 < sorted.length && sorted[j + 1].value === sorted[i].value) {
			j += 1;
		}
		const rank = (i + 1 + j + 1) / 2;
		for (let item = i; item <= j; item++) {
			ranks[sorted[item].i] = rank;
		}
		i = j + 1;
	}

	return ranks.map((value) => round(value));
};

export const getMethodScores = (
	alternatives: Alternative[],
	criteria: Criteria[],
	order: number[],
): MethodScores => {
	const weightedRaw = getWeightedScores(alternatives, criteria);
	const pairwiseRaw = getPairwiseScores(alternatives);
	const rankRaw = getRankScores(alternatives, order);
	const topsisRaw = getTopsisCloseness(alternatives, criteria).map((value) =>
		round(value * 10),
	);

	return {
		raw: {
			weightedSum: weightedRaw,
			pairwise: pairwiseRaw,
			rankOrder: rankRaw,
			topsis: topsisRaw,
		},
		normalized10: {
			weightedSum: normalizeWeighted10(weightedRaw, criteria),
			pairwise: normalizePairwise10(pairwiseRaw, alternatives.length),
			rankOrder: rankRaw,
			topsis: topsisRaw,
		},
	};
};

export const getMethodRanks = (scores: MethodScoreMap): MethodScoreMap => {
	return {
		weightedSum: rankWithTies(scores.weightedSum),
		pairwise: rankWithTies(scores.pairwise),
		rankOrder: rankWithTies(scores.rankOrder),
		topsis: rankWithTies(scores.topsis),
	};
};

export const getConsensusScore10 = (
	scores: MethodScoreMap,
	includedMethods: MethodKey[],
) => {
	if (includedMethods.length === 0) {
		return scores.weightedSum.map(() => 0);
	}
	const count = scores.weightedSum.length;
	const totals = new Array(count).fill(0);
	for (const method of includedMethods) {
		const methodScores = scores[method] ?? [];
		for (let i = 0; i < count; i++) {
			totals[i] += methodScores[i] ?? 0;
		}
	}
	return totals.map((value) => round(value / includedMethods.length));
};

export const getConsensusRank = (
	methodRanks: MethodScoreMap,
	includedMethods: MethodKey[],
	consensusScores: number[],
): ConsensusRank => {
	const count = consensusScores.length;
	const meanRank = new Array(count).fill(0);
	if (includedMethods.length === 0 || count === 0) {
		return {
			meanRank,
			winnerIndex: null,
			runnerUpIndex: null,
			runnerUpGap: 0,
			order: [],
		};
	}

	for (const method of includedMethods) {
		const ranks = methodRanks[method] ?? [];
		for (let i = 0; i < count; i++) {
			meanRank[i] += ranks[i] ?? count;
		}
	}

	for (let i = 0; i < count; i++) {
		meanRank[i] = round(meanRank[i] / includedMethods.length);
	}

	const order = Array.from({ length: count }, (_, i) => i).sort((a, b) => {
		if (meanRank[a] !== meanRank[b]) {
			return meanRank[a] - meanRank[b];
		}
		if (consensusScores[a] !== consensusScores[b]) {
			return consensusScores[b] - consensusScores[a];
		}
		return a - b;
	});

	const winnerIndex = order[0] ?? null;
	const runnerUpIndex = order[1] ?? null;
	const runnerUpGap =
		winnerIndex == null || runnerUpIndex == null
			? 0
			: round(consensusScores[winnerIndex] - consensusScores[runnerUpIndex]);

	return { meanRank, winnerIndex, runnerUpIndex, runnerUpGap, order };
};

export const getAgreementLevel = (
	consensus: ConsensusRank,
	methodRanks: MethodScoreMap,
	includedMethods: MethodKey[],
) => {
	if (includedMethods.length === 0 || consensus.winnerIndex == null) {
		return "none" as const;
	}
	let votes = 0;
	for (const method of includedMethods) {
		if ((methodRanks[method]?.[consensus.winnerIndex] ?? 999) === 1) {
			votes += 1;
		}
	}
	const ratio = votes / includedMethods.length;
	if (ratio >= 0.75) {
		return "high" as const;
	}
	if (ratio >= 0.5) {
		return "medium" as const;
	}
	return "low" as const;
};

interface GuidanceOptions {
	agreement: "none" | "high" | "medium" | "low";
	alternatives: Alternative[];
	consensus?: ConsensusRank;
	includedMethods?: MethodKey[];
	method?: MethodKey;
}

export const getGuidanceCopy = ({
	agreement,
	alternatives,
	consensus,
	includedMethods,
	method,
}: GuidanceOptions): GuidanceCopy => {
	const safeConsensus = consensus ?? {
		meanRank: [],
		order: [],
		runnerUpGap: 0,
		runnerUpIndex: null,
		winnerIndex: null,
	};
	const safeIncludedMethods = includedMethods ?? [];

	const winner =
		safeConsensus.winnerIndex == null
			? null
			: alternatives[safeConsensus.winnerIndex]?.name;
	const runner =
		safeConsensus.runnerUpIndex == null
			? null
			: alternatives[safeConsensus.runnerUpIndex]?.name;

	if (method === "weightedSum") {
		return {
			summary:
				"Weighted Sum combines each criterion score with its weight, then adds them into one total.",
			comparison:
				"This method is strongest when your criteria weights reflect real priorities and score scales are consistent.",
			caveat:
				"If scores are close, small weight changes can flip the order. Use Summary to confirm agreement with other methods.",
		};
	}
	if (method === "pairwise") {
		return {
			summary:
				"Pairwise compares alternatives head-to-head, which can surface preference clarity when absolute scoring is difficult.",
			comparison:
				"It emphasizes direct wins and ties instead of weighted totals, so ranking can differ from Weighted Sum or TOPSIS.",
			caveat:
				"Many ties reduce separation between options. Revisit close matchups if the output feels flat.",
		};
	}
	if (method === "rankOrder") {
		return {
			summary:
				"Rank converts your top-to-bottom ordering into a 0-10 score scale, keeping focus on ordinal preference.",
			comparison:
				"It ignores absolute performance size, so it is useful as a gut-check against weight-driven methods.",
			caveat:
				"When options are near-equal, forced ordering can overstate differences.",
		};
	}
	if (method === "topsis") {
		return {
			summary:
				"TOPSIS favors alternatives closest to the ideal profile and farthest from the worst profile.",
			comparison:
				"It uses the same weighted inputs as Weighted Sum but evaluates distance structure across criteria.",
			caveat:
				"If criteria values collapse into similar patterns, TOPSIS separation can narrow quickly.",
		};
	}

	if (safeIncludedMethods.length === 0 || winner == null) {
		return {
			summary: "No methods are included in Summary yet.",
			comparison:
				"Enable one or more methods to generate cross-method guidance.",
			caveat:
				"After enabling methods, review agreement and runner-up gap before choosing an option.",
		};
	}

	const agreementText =
		agreement === "high"
			? "Most included methods agree on the same top option."
			: agreement === "medium"
				? "Methods are partly aligned, with some disagreement."
				: "Methods disagree meaningfully on the best option.";

	return {
		summary:
			runner == null
				? `${winner} is currently the top recommendation from the included methods.`
				: `${winner} currently leads, with ${runner} as the closest runner-up.`,
		comparison: `${agreementText} This guidance blends rank position across methods instead of relying on one scoring model.`,
		caveat:
			"If your priorities change, revisit criteria weights and pairwise judgments, then confirm the summary remains stable.",
	};
};

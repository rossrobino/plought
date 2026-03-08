import type { Alternative, Criteria } from "$lib/types";
import {
	getTopsisClosenessFromNormalized,
	getTopsisNormalized,
} from "$lib/util/topsis";

type RobustnessMethodKey = "weightedSum" | "topsis" | "combined";

interface RobustnessAltStats {
	name: string;
	winRatePct: number;
	avgRank: number;
	bestRank: number;
	worstRank: number;
}

interface RobustnessMethodStats {
	method: RobustnessMethodKey;
	alternatives: RobustnessAltStats[];
	winnerIndex: number | null;
}

interface RobustnessResult {
	runs: number;
	methods: Record<RobustnessMethodKey, RobustnessMethodStats>;
}

export const robustnessRuns = 500;
export const summaryRobustnessRuns = 200;
export const robustnessStrength = 0.1;

const tieEpsilon = 1e-9;

const round = (value: number, digits = 2) => {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Number(value.toFixed(digits));
};

const safeNumber = (value: number) => {
	if (Number.isFinite(value)) {
		return value;
	}
	return 0;
};

const normalizeWeights = (weights: number[]) => {
	if (weights.length === 0) {
		return [];
	}

	const clean = weights.map((value) => {
		const next = safeNumber(value);
		return next > 0 ? next : 0;
	});
	const total = clean.reduce((sum, value) => sum + value, 0);

	if (total <= 0) {
		const uniform = 1 / clean.length;
		return clean.map(() => uniform);
	}

	return clean.map((value) => value / total);
};

const perturbWeights = (
	base: number[],
	rng: () => number,
	strength = robustnessStrength,
) => {
	const jittered = base.map((value) => {
		const delta = (rng() * 2 - 1) * strength;
		const next = value * (1 + delta);
		if (!Number.isFinite(next) || next < 0) {
			return 0;
		}
		return next;
	});
	return normalizeWeights(jittered);
};

const rankFromScores = (scores: number[]) => {
	const sorted = scores
		.map((value, i) => ({ i, value: safeNumber(value) }))
		.sort((a, b) => {
			if (Math.abs(b.value - a.value) > tieEpsilon) {
				return b.value - a.value;
			}
			return a.i - b.i;
		});

	const ranks = Array.from({ length: scores.length }, () => 0);
	let i = 0;
	while (i < sorted.length) {
		let j = i;
		while (
			j + 1 < sorted.length &&
			Math.abs(sorted[j + 1].value - sorted[i].value) <= tieEpsilon
		) {
			j += 1;
		}

		const rank = (i + 1 + (j + 1)) / 2;
		for (let item = i; item <= j; item++) {
			ranks[sorted[item].i] = rank;
		}
		i = j + 1;
	}

	return ranks;
};

const accumulateWinCredit = (scores: number[], wins: number[]) => {
	if (scores.length === 0) {
		return wins;
	}

	let best = -Infinity;
	for (const score of scores) {
		const value = safeNumber(score);
		if (value > best) {
			best = value;
		}
	}
	if (!Number.isFinite(best)) {
		return wins;
	}

	const winners = scores
		.map((score, i) => ({ i, value: safeNumber(score) }))
		.filter((item) => Math.abs(item.value - best) <= tieEpsilon);

	if (winners.length === 0) {
		return wins;
	}

	const credit = 1 / winners.length;
	for (const item of winners) {
		wins[item.i] = (wins[item.i] ?? 0) + credit;
	}
	return wins;
};

const getWeightedScore10 = (alternatives: Alternative[], weights: number[]) => {
	const weightSum = weights.reduce((sum, value) => sum + value, 0);
	return alternatives.map((alt) => {
		let total = 0;
		for (let i = 0; i < weights.length; i++) {
			total += (weights[i] ?? 0) * safeNumber(alt.scores[i] ?? 0);
		}
		if (weightSum <= 0) {
			return 0;
		}
		return total / weightSum;
	});
};

const getWinnerIndex = (wins: number[], rankSums: number[]) => {
	if (wins.length === 0) {
		return null;
	}

	let winner = 0;
	for (let i = 1; i < wins.length; i++) {
		const winGap = wins[i] - wins[winner];
		if (winGap > tieEpsilon) {
			winner = i;
			continue;
		}
		if (Math.abs(winGap) <= tieEpsilon) {
			const rankGap = (rankSums[i] ?? 0) - (rankSums[winner] ?? 0);
			if (rankGap < -tieEpsilon) {
				winner = i;
			}
		}
	}

	return winner;
};

const buildEmptyMethod = (
	method: RobustnessMethodKey,
): RobustnessMethodStats => {
	return { method, alternatives: [], winnerIndex: null };
};

export const getRobustnessAnalysis = (
	alternatives: Alternative[],
	criteria: Criteria[],
	strength = robustnessStrength,
	runs = robustnessRuns,
): RobustnessResult => {
	const totalRuns = Math.max(1, Math.round(safeNumber(runs)));
	const count = alternatives.length;
	if (count === 0 || criteria.length === 0) {
		return {
			runs: totalRuns,
			methods: {
				weightedSum: buildEmptyMethod("weightedSum"),
				topsis: buildEmptyMethod("topsis"),
				combined: buildEmptyMethod("combined"),
			},
		};
	}

	const methods: RobustnessMethodKey[] = ["weightedSum", "topsis", "combined"];
	const createSeries = (value: number) => {
		return Array.from({ length: count }, () => value);
	};

	const wins: Record<RobustnessMethodKey, number[]> = {
		weightedSum: createSeries(0),
		topsis: createSeries(0),
		combined: createSeries(0),
	};
	const rankSums: Record<RobustnessMethodKey, number[]> = {
		weightedSum: createSeries(0),
		topsis: createSeries(0),
		combined: createSeries(0),
	};
	const bestRanks: Record<RobustnessMethodKey, number[]> = {
		weightedSum: createSeries(Infinity),
		topsis: createSeries(Infinity),
		combined: createSeries(Infinity),
	};
	const worstRanks: Record<RobustnessMethodKey, number[]> = {
		weightedSum: createSeries(0),
		topsis: createSeries(0),
		combined: createSeries(0),
	};

	const baseWeights = normalizeWeights(
		criteria.map((item) => safeNumber(item.weight)),
	);
	const normalized = getTopsisNormalized(alternatives, criteria.length);
	const rng = Math.random;
	const runStrength = Math.min(1, Math.max(0, safeNumber(strength)));

	for (let run = 0; run < totalRuns; run++) {
		const weights = perturbWeights(baseWeights, rng, runStrength);
		const weightedScores = getWeightedScore10(alternatives, weights);
		const topsisScores = getTopsisClosenessFromNormalized(
			normalized,
			weights,
		).map((value) => safeNumber(value) * 10);
		const combinedScores = weightedScores.map((value, i) => {
			return (value + (topsisScores[i] ?? 0)) / 2;
		});

		const scoreMap: Record<RobustnessMethodKey, number[]> = {
			weightedSum: weightedScores,
			topsis: topsisScores,
			combined: combinedScores,
		};

		for (const method of methods) {
			const methodScores = scoreMap[method];
			accumulateWinCredit(methodScores, wins[method]);
			const ranks = rankFromScores(methodScores);

			for (let i = 0; i < count; i++) {
				const rank = ranks[i] ?? 0;
				rankSums[method][i] += rank;
				bestRanks[method][i] = Math.min(bestRanks[method][i], rank);
				worstRanks[method][i] = Math.max(worstRanks[method][i], rank);
			}
		}
	}

	const methodsResult = methods.reduce(
		(acc, method) => {
			const alternativesStats = alternatives.map((item, i) => {
				return {
					name: item.name,
					winRatePct: round((wins[method][i] / totalRuns) * 100),
					avgRank: round(rankSums[method][i] / totalRuns),
					bestRank: round(bestRanks[method][i]),
					worstRank: round(worstRanks[method][i]),
				};
			});

			acc[method] = {
				method,
				alternatives: alternativesStats,
				winnerIndex: getWinnerIndex(wins[method], rankSums[method]),
			};
			return acc;
		},
		{} as Record<RobustnessMethodKey, RobustnessMethodStats>,
	);

	return { runs: totalRuns, methods: methodsResult };
};

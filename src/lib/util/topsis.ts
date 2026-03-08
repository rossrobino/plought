import type { Alternative, Criteria } from "$lib/types";

const getSafeValue = (value: number) => {
	if (Number.isFinite(value)) {
		return value;
	}
	return 0;
};

interface TopsisDiagnostics {
	closeness: number[];
	distanceBest: number[];
	distanceWorst: number[];
}

const getNormalized = (alternatives: Alternative[], cols: number) => {
	const rows = alternatives.length;
	return Array.from({ length: rows }, (_, i) => {
		return Array.from({ length: cols }, (_, j) => {
			return getSafeValue(alternatives[i]?.scores[j]);
		});
	});
};

const applyNormalization = (normalized: number[][]) => {
	const rows = normalized.length;
	const cols = normalized[0]?.length ?? 0;
	for (let j = 0; j < cols; j++) {
		let sumSquares = 0;
		for (let i = 0; i < rows; i++) {
			const score = normalized[i][j];
			sumSquares += score * score;
		}
		const norm = Math.sqrt(sumSquares);
		for (let i = 0; i < rows; i++) {
			normalized[i][j] = norm > 0 ? normalized[i][j] / norm : 0;
		}
	}
	return normalized;
};

const getDiagnostics = (normalized: number[][], weights: number[]) => {
	const rows = normalized.length;
	const cols = weights.length;

	const weighted = Array.from({ length: rows }, () => {
		return Array.from({ length: cols }, () => 0);
	});
	for (let j = 0; j < cols; j++) {
		const weight = getSafeValue(weights[j] ?? 0);
		for (let i = 0; i < rows; i++) {
			weighted[i][j] = (normalized[i]?.[j] ?? 0) * weight;
		}
	}

	const idealBest = Array.from({ length: cols }, () => 0);
	const idealWorst = Array.from({ length: cols }, () => 0);
	for (let j = 0; j < cols; j++) {
		let max = -Infinity;
		let min = Infinity;
		for (let i = 0; i < rows; i++) {
			const value = weighted[i][j];
			if (value > max) {
				max = value;
			}
			if (value < min) {
				min = value;
			}
		}
		idealBest[j] = max === -Infinity ? 0 : max;
		idealWorst[j] = min === Infinity ? 0 : min;
	}

	const distanceBest = weighted.map((row) => {
		let sum = 0;
		for (let j = 0; j < cols; j++) {
			const diff = row[j] - idealBest[j];
			sum += diff * diff;
		}
		return Math.sqrt(sum);
	});

	const distanceWorst = weighted.map((row) => {
		let sum = 0;
		for (let j = 0; j < cols; j++) {
			const diff = row[j] - idealWorst[j];
			sum += diff * diff;
		}
		return Math.sqrt(sum);
	});

	const closeness = distanceBest.map((dBest, i) => {
		const dWorst = distanceWorst[i];
		const denominator = dBest + dWorst;
		if (denominator === 0) {
			return 0;
		}
		return dWorst / denominator;
	});

	return { closeness, distanceBest, distanceWorst };
};

export const getTopsisNormalized = (
	alternatives: Alternative[],
	criteriaCount: number,
) => {
	if (alternatives.length === 0 || criteriaCount === 0) {
		return [];
	}
	return applyNormalization(getNormalized(alternatives, criteriaCount));
};

export const getTopsisClosenessFromNormalized = (
	normalized: number[][],
	weights: number[],
) => {
	return getDiagnostics(normalized, weights).closeness;
};

export const getTopsisDiagnostics = (
	alternatives: Alternative[],
	criteria: Criteria[],
): TopsisDiagnostics => {
	const rows = alternatives.length;
	const cols = criteria.length;
	if (rows === 0 || cols === 0) {
		const empty = alternatives.map(() => 0);
		return { closeness: empty, distanceBest: empty, distanceWorst: empty };
	}

	return getDiagnostics(
		getTopsisNormalized(alternatives, cols),
		criteria.map((item) => getSafeValue(item?.weight)),
	);
};

export const getTopsisCloseness = (
	alternatives: Alternative[],
	criteria: Criteria[],
) => {
	return getTopsisDiagnostics(alternatives, criteria).closeness;
};

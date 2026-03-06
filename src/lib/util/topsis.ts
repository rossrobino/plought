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

	const normalized = Array.from({ length: rows }, () => {
		return Array.from({ length: cols }, () => 0);
	});
	for (let j = 0; j < cols; j++) {
		let sumSquares = 0;
		for (let i = 0; i < rows; i++) {
			const score = getSafeValue(alternatives[i]?.scores[j]);
			sumSquares += score * score;
		}
		const norm = Math.sqrt(sumSquares);
		for (let i = 0; i < rows; i++) {
			const score = getSafeValue(alternatives[i]?.scores[j]);
			normalized[i][j] = norm > 0 ? score / norm : 0;
		}
	}

	const weighted = Array.from({ length: rows }, () => {
		return Array.from({ length: cols }, () => 0);
	});
	for (let j = 0; j < cols; j++) {
		const weight = getSafeValue(criteria[j]?.weight);
		for (let i = 0; i < rows; i++) {
			weighted[i][j] = normalized[i][j] * weight;
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

export const getTopsisCloseness = (
	alternatives: Alternative[],
	criteria: Criteria[],
) => {
	return getTopsisDiagnostics(alternatives, criteria).closeness;
};

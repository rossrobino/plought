import type { Alternative, Criteria } from "$lib/types";

const getSafeValue = (value: number) => {
	if (Number.isFinite(value)) {
		return value;
	}
	return 0;
};

export const getTopsisCloseness = (
	alternatives: Alternative[],
	criteria: Criteria[],
) => {
	const rows = alternatives.length;
	const cols = criteria.length;
	if (rows === 0 || cols === 0) {
		return alternatives.map(() => 0);
	}

	const normalized = Array.from({ length: rows }, () =>
		new Array(cols).fill(0),
	);
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

	const weighted = Array.from({ length: rows }, () => new Array(cols).fill(0));
	for (let j = 0; j < cols; j++) {
		const weight = getSafeValue(criteria[j]?.weight);
		for (let i = 0; i < rows; i++) {
			weighted[i][j] = normalized[i][j] * weight;
		}
	}

	const idealBest = new Array(cols).fill(0);
	const idealWorst = new Array(cols).fill(0);
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

	return weighted.map((row) => {
		let bestDistance = 0;
		let worstDistance = 0;
		for (let j = 0; j < cols; j++) {
			const diffBest = row[j] - idealBest[j];
			const diffWorst = row[j] - idealWorst[j];
			bestDistance += diffBest * diffBest;
			worstDistance += diffWorst * diffWorst;
		}
		const dBest = Math.sqrt(bestDistance);
		const dWorst = Math.sqrt(worstDistance);
		const denominator = dBest + dWorst;
		if (denominator === 0) {
			return 0;
		}
		return dWorst / denominator;
	});
};

export const getTopsisScore10 = (
	alternatives: Alternative[],
	criteria: Criteria[],
	index: number,
) => {
	const closeness = getTopsisCloseness(alternatives, criteria);
	const value = closeness[index] ?? 0;
	return Number((value * 10).toFixed(2));
};

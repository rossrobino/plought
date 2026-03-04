import type { Criteria } from "$lib/types";

export const allocationTotal = 100;

const toSafeNumber = (value: number) => {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return value;
};

const clamp = (value: number, min: number, max: number) => {
	return Math.max(min, Math.min(max, value));
};

const normalizeRow = (values: number[], total: number) => {
	const count = values.length;
	if (count <= 0) {
		return [];
	}
	if (total <= 0) {
		return new Array(count).fill(0);
	}

	const positive = values.map((value) => Math.max(0, toSafeNumber(value)));
	const sum = positive.reduce((a, b) => a + b, 0);
	if (sum <= 0) {
		return splitEven(count, total);
	}

	return positive.map((value) => {
		return (value / sum) * total;
	});
};

export const splitEven = (count: number, total = allocationTotal) => {
	if (count <= 0 || total <= 0) {
		return [];
	}
	return new Array(count).fill(total / count);
};

export const normalizeAllocationRow = (
	row: number[] | null | undefined,
	count: number,
	total = allocationTotal,
) => {
	if (count <= 0) {
		return [];
	}
	if (total <= 0) {
		return new Array(count).fill(0);
	}

	const values = Array.from({ length: count }, (_, i) => {
		return Math.max(0, toSafeNumber(row?.[i] ?? 0));
	});

	return normalizeRow(values, total);
};

export const normalizeAllocation = (
	matrix: number[][] | null | undefined,
	criteriaCount: number,
	alternativeCount: number,
	total = allocationTotal,
) => {
	return Array.from({ length: criteriaCount }, (_, i) => {
		return normalizeAllocationRow(matrix?.[i], alternativeCount, total);
	});
};

export const rebalanceAllocationRow = (
	row: number[] | null | undefined,
	index: number,
	value: number,
	total = allocationTotal,
) => {
	const count = row?.length ?? 0;
	if (count <= 0) {
		return [];
	}
	if (total <= 0) {
		return new Array(count).fill(0);
	}

	const normalized = normalizeAllocationRow(row, count, total);
	if (index < 0 || index >= count) {
		return normalized;
	}

	const nextValue = clamp(toSafeNumber(value), 0, total);
	if (count === 1) {
		return [total];
	}

	const currentValue = normalized[index] ?? 0;
	if (Math.abs(currentValue - nextValue) < 0.000001) {
		return normalized;
	}

	const next = [...normalized];
	const otherIndices = next.map((_, i) => i).filter((i) => i !== index);
	next[index] = nextValue;

	const targetOthers = total - nextValue;
	if (targetOthers <= 0) {
		for (const i of otherIndices) {
			next[i] = 0;
		}
		return next;
	}

	const redistributed = normalizeRow(
		otherIndices.map((i) => normalized[i] ?? 0),
		targetOthers,
	);
	for (let i = 0; i < otherIndices.length; i++) {
		next[otherIndices[i]] = redistributed[i];
	}

	return next;
};

const round = (value: number) => {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Number(value.toFixed(2));
};

export const getAllocateScores = (matrix: number[][], criteria: Criteria[]) => {
	const criteriaCount = criteria.length;
	const alternativeCount = matrix[0]?.length ?? 0;
	if (criteriaCount === 0 || alternativeCount === 0) {
		return [];
	}

	const totalWeight = criteria.reduce((sum, item) => {
		return sum + Math.max(0, toSafeNumber(item.weight));
	}, 0);

	if (totalWeight <= 0) {
		return new Array(alternativeCount).fill(0);
	}

	return Array.from({ length: alternativeCount }, (_, altIndex) => {
		let score = 0;
		for (let i = 0; i < criteriaCount; i++) {
			score +=
				Math.max(0, toSafeNumber(criteria[i]?.weight)) *
				((matrix[i]?.[altIndex] ?? 0) / 10);
		}
		return round(score / totalWeight);
	});
};

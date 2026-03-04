import type { Criteria } from "$lib/types";
import {
	getAllocateScores,
	normalizeAllocation,
	normalizeAllocationRow,
	rebalanceAllocationRow,
	splitEven,
} from "$lib/util/allocate";
import { describe, expect, it } from "vitest";

describe("allocate utilities", () => {
	it("splits totals evenly", () => {
		const row = splitEven(3, 10);
		expect(row.length).toBe(3);
		expect(row[0]).toBeCloseTo(10 / 3, 8);
		expect(row[1]).toBeCloseTo(10 / 3, 8);
		expect(row[2]).toBeCloseTo(10 / 3, 8);
		expect(row.reduce((total, value) => total + value, 0)).toBeCloseTo(10, 8);
		expect(splitEven(0, 10)).toEqual([]);
	});

	it("normalizes rows to totals while preserving proportions", () => {
		const equal = normalizeAllocationRow([10, 10, 10], 3, 100);
		expect(equal.length).toBe(3);
		expect(equal[0]).toBeCloseTo(100 / 3, 8);
		expect(equal[1]).toBeCloseTo(100 / 3, 8);
		expect(equal[2]).toBeCloseTo(100 / 3, 8);
		expect(equal.reduce((total, value) => total + value, 0)).toBeCloseTo(
			100,
			8,
		);

		const zeros = normalizeAllocationRow([0, 0, 0], 3, 100);
		expect(zeros.length).toBe(3);
		expect(zeros[0]).toBeCloseTo(100 / 3, 8);
		expect(zeros[1]).toBeCloseTo(100 / 3, 8);
		expect(zeros[2]).toBeCloseTo(100 / 3, 8);
		expect(normalizeAllocationRow(undefined, 2, 100)).toEqual([50, 50]);
	});

	it("normalizes matrix dimensions", () => {
		expect(normalizeAllocation([[100], [40, 60]], 3, 2, 100)).toEqual([
			[100, 0],
			[40, 60],
			[50, 50],
		]);
	});

	it("rebalances row while preserving total", () => {
		const row = rebalanceAllocationRow([40, 30, 30], 0, 70, 100);

		expect(row).toEqual([70, 15, 15]);
		expect(row.reduce((total, value) => total + value, 0)).toBe(100);
	});

	it("redistributes across alternatives proportionally over repeated steps", () => {
		let row = [40, 20, 20, 20];
		row = rebalanceAllocationRow(row, 0, 39, 100);
		expect(row[0]).toBe(39);
		expect(row.reduce((total, value) => total + value, 0)).toBeCloseTo(100, 8);
		expect(
			Math.max(...row.slice(1)) - Math.min(...row.slice(1)),
		).toBeLessThanOrEqual(0.001);
		row = rebalanceAllocationRow(row, 0, 38, 100);
		expect(row[0]).toBe(38);
		expect(row.reduce((total, value) => total + value, 0)).toBeCloseTo(100, 8);
		expect(
			Math.max(...row.slice(1)) - Math.min(...row.slice(1)),
		).toBeLessThanOrEqual(0.001);
		row = rebalanceAllocationRow(row, 0, 37, 100);
		expect(row[0]).toBe(37);
		expect(row.reduce((total, value) => total + value, 0)).toBeCloseTo(100, 8);
		expect(
			Math.max(...row.slice(1)) - Math.min(...row.slice(1)),
		).toBeLessThanOrEqual(0.001);
	});

	it("converts allocation matrix into weighted 0-10 scores", () => {
		const matrix = [
			[70, 20, 10],
			[20, 30, 50],
		];
		const criteria: Criteria[] = [
			{ name: "Cost", weight: 0.7 },
			{ name: "Speed", weight: 0.3 },
		];

		expect(getAllocateScores(matrix, criteria)).toEqual([5.5, 2.3, 2.2]);
	});
});

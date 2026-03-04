import type { Alternative, Criteria } from "$lib/types";
import { getTopsisCloseness, getTopsisDiagnostics } from "$lib/util/topsis";
import { describe, expect, it } from "vitest";

describe("topsis utilities", () => {
	it("returns empty diagnostics when no rows are provided", () => {
		const cri: Criteria[] = [{ name: "Cost", weight: 1 }];
		const res = getTopsisDiagnostics([], cri);

		expect(res).toEqual({ closeness: [], distanceBest: [], distanceWorst: [] });
	});

	it("prefers higher scores for a single weighted criterion", () => {
		const alt: Alternative[] = [
			{ name: "A", scores: [1], pairwise: [0.5, 0.5] },
			{ name: "B", scores: [2], pairwise: [0.5, 0.5] },
		];
		const cri: Criteria[] = [{ name: "Value", weight: 1 }];
		const close = getTopsisCloseness(alt, cri);

		expect(close).toEqual([0, 1]);
	});

	it("sanitizes non-finite numbers to avoid NaN output", () => {
		const alt: Alternative[] = [
			{ name: "A", scores: [Number.NaN], pairwise: [0.5, 0.5] },
			{ name: "B", scores: [Number.POSITIVE_INFINITY], pairwise: [0.5, 0.5] },
		];
		const cri: Criteria[] = [{ name: "Risk", weight: Number.NaN }];
		const res = getTopsisDiagnostics(alt, cri);

		expect(res.closeness).toEqual([0, 0]);
		expect(res.distanceBest.every((value) => Number.isFinite(value))).toBe(
			true,
		);
		expect(res.distanceWorst.every((value) => Number.isFinite(value))).toBe(
			true,
		);
	});
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage implements Storage {
	#map = new Map<string, string>();

	get length() {
		return this.#map.size;
	}

	clear() {
		this.#map.clear();
	}

	getItem(key: string) {
		return this.#map.get(key) ?? null;
	}

	key(i: number) {
		return [...this.#map.keys()][i] ?? null;
	}

	removeItem(key: string) {
		this.#map.delete(key);
	}

	setItem(key: string, value: string) {
		this.#map.set(key, String(value));
	}
}

const setWindow = () => {
	const storage = new MemoryStorage();
	Object.defineProperty(globalThis, "window", {
		configurable: true,
		value: { localStorage: storage, sessionStorage: storage },
	});
};

let state: typeof import("$lib/state");

describe("state", () => {
	beforeEach(async () => {
		setWindow();
		vi.resetModules();
		state = await import("$lib/state");
		state.reset();
	});

	afterEach(() => {
		Reflect.deleteProperty(globalThis, "window");
	});

	it("normalizes rank order by removing invalid entries and filling missing ids", () => {
		expect(state.normalizeRankOrder([2, 2, -1, 5, 1.5, 0], 4)).toEqual([
			2, 0, 1, 3,
		]);
	});

	it("computes rank scores on a 0-10 scale", () => {
		expect(state.getRankScore(0, 5)).toBe(10);
		expect(state.getRankScore(2, 5)).toBe(5);
		expect(state.getRankScore(4, 5)).toBe(0);
		expect(state.getRankScore(0, 1)).toBe(10);
	});

	it("marks methods as used and toggles inclusion independently", () => {
		expect(state.isMethodUsed("pairwise")).toBe(false);
		expect(state.isMethodIncluded("pairwise")).toBe(false);

		state.markMethodUsed("pairwise");
		expect(state.isMethodUsed("pairwise")).toBe(true);
		expect(state.isMethodIncluded("pairwise")).toBe(true);

		state.toggleMethodIncluded("pairwise");
		expect(state.isMethodUsed("pairwise")).toBe(true);
		expect(state.isMethodIncluded("pairwise")).toBe(false);
	});

	it("marks setup steps as used and keeps repeat marks idempotent", () => {
		expect(state.isSetupStepUsed("criteria")).toBe(false);
		state.markSetupStepUsed("criteria");
		expect(state.isSetupStepUsed("criteria")).toBe(true);
		state.markSetupStepUsed("criteria");
		expect(state.isSetupStepUsed("criteria")).toBe(true);
	});

	it("syncs rank order when alternatives change", () => {
		state.alternatives.current.push({
			name: "Alternative #3",
			scores: [0, 0],
			pairwise: [0.5, 0.5, 0.5],
		});
		state.rankOrder.current.splice(0, state.rankOrder.current.length, 2, 99, 2);

		expect(state.syncRankOrder()).toEqual([2, 0, 1]);
	});

	it("syncs rank order to an explicit count", () => {
		state.rankOrder.current.splice(0, state.rankOrder.current.length, 1, 0, 5);

		expect(state.syncRankOrder(2)).toEqual([1, 0]);
	});

	it("syncs allocation matrix when criteria and alternatives change", () => {
		state.criteria.current.push({ name: "Criterion #3", weight: 0.1 });
		state.alternatives.current.push({
			name: "Alternative #3",
			scores: [0, 0, 0],
			pairwise: [0.5, 0.5, 0.5],
		});

		const matrix = state.syncAllocation();

		expect(matrix.length).toBe(3);
		expect(matrix.every((row) => row.length === 3)).toBe(true);
		expect(
			matrix.every((row) => {
				return Math.abs(row.reduce((a, b) => a + b, 0) - 100) < 0.001;
			}),
		).toBe(true);
	});

	it("exports snapshot state with all expected keys", () => {
		const snapshot = state.exportSnapshotState();

		expect(Object.keys(snapshot).sort()).toEqual([
			"allocation",
			"alternatives",
			"criteria",
			"decision",
			"methodMeta",
			"rankOrder",
			"setupStepMeta",
		]);
		expect(Array.isArray(snapshot.criteria)).toBe(true);
		expect(Array.isArray(snapshot.alternatives)).toBe(true);
		expect(Array.isArray(snapshot.allocation)).toBe(true);
		expect(Array.isArray(snapshot.rankOrder)).toBe(true);
	});

	it("imports snapshot state and defaults missing keys", () => {
		state.markMethodUsed("pairwise");
		state.markSetupStepUsed("criteria");
		state.importSnapshotState({
			decision: { title: "Imported", goal: "Imported goal" },
		});

		expect(state.decision.current).toEqual({
			title: "Imported",
			goal: "Imported goal",
		});
		expect(state.criteria.current.length).toBe(2);
		expect(state.alternatives.current.length).toBe(2);
		expect(state.allocation.current.length).toBe(2);
		expect(state.rankOrder.current.length).toBe(2);
		expect(state.isMethodUsed("pairwise")).toBe(false);
		expect(state.isSetupStepUsed("criteria")).toBe(false);
	});

	it("imports snapshot state and normalizes dependent dimensions", () => {
		state.importSnapshotState({
			criteria: [
				{ name: "C1", weight: 0.7 },
				{ name: "C2", weight: 0.3 },
				{ name: "C3", weight: 10 },
			],
			alternatives: [
				{ name: "A", scores: [11], pairwise: [0.5, 1, 1] },
				{ name: "", scores: [-2, Number.NaN, 3], pairwise: [0, 0.5, 1] },
				{ name: "C", scores: [2, 2, 2], pairwise: [0, 0, 0.5] },
			],
			allocation: [[40, 30, 30]],
			rankOrder: [5, 1, 1],
			methodMeta: { weightedSum: { used: true, included: true } },
			setupStepMeta: { start: { used: true } },
		});

		expect(state.criteria.current.length).toBe(3);
		expect(state.criteria.current[2].weight).toBe(1);
		expect(state.alternatives.current.length).toBe(3);
		expect(
			state.alternatives.current.every((item) => item.scores.length === 3),
		).toBe(true);
		expect(
			state.alternatives.current.every((item) =>
				item.scores.every((score) => {
					return score >= 0 && score <= 10;
				}),
			),
		).toBe(true);
		expect(
			state.alternatives.current.every((item) => item.pairwise.length === 3),
		).toBe(true);
		expect(state.alternatives.current[0].pairwise[1]).toBe(1);
		expect(state.alternatives.current[1].pairwise[0]).toBe(0);
		expect(state.allocation.current.length).toBe(3);
		expect(state.allocation.current.every((row) => row.length === 3)).toBe(
			true,
		);
		expect(
			state.allocation.current.every((row) => {
				return Math.abs(row.reduce((a, b) => a + b, 0) - 100) < 0.001;
			}),
		).toBe(true);
		expect(state.rankOrder.current).toEqual([1, 0, 2]);
		expect(state.isMethodUsed("weightedSum")).toBe(true);
		expect(state.isMethodUsed("pairwise")).toBe(false);
		expect(state.isSetupStepUsed("start")).toBe(true);
		expect(state.isSetupStepUsed("criteria")).toBe(false);
	});
});

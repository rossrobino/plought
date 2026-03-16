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

	it("marks app usage independently", () => {
		expect(state.isAppUsed("weigh")).toBe(false);
		expect(state.isAppUsed("score")).toBe(false);
		state.markAppUsed("weigh");
		expect(state.isAppUsed("weigh")).toBe(true);
		expect(state.isAppUsed("score")).toBe(false);
		state.markMethodUsed("weightedSum");
		expect(state.isAppUsed("score")).toBe(false);
	});

	it("marks setup steps as used and keeps repeat marks idempotent", () => {
		expect(state.isSetupStepUsed("criteria")).toBe(false);
		state.markSetupStepUsed("criteria");
		expect(state.isSetupStepUsed("criteria")).toBe(true);
		state.markSetupStepUsed("criteria");
		expect(state.isSetupStepUsed("criteria")).toBe(true);
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

	it("appends alternatives and updates dependent state", () => {
		const added = state.appendAlternatives(["Seattle", "Portland"]);

		expect(added).toEqual(["Seattle", "Portland"]);
		expect(state.alternatives.current.map((item) => item.name)).toEqual([
			"Alternative #1",
			"Alternative #2",
			"Seattle",
			"Portland",
		]);
		expect(
			state.alternatives.current.every((item) => item.scores.length === 2),
		).toBe(true);
		expect(
			state.alternatives.current.every((item) => item.pairwise.length === 4),
		).toBe(true);
		expect(state.allocation.current.length).toBe(2);
		expect(state.allocation.current.every((row) => row.length === 4)).toBe(
			true,
		);
	});

	it("replaces untouched alternative defaults before appending AI suggestions", () => {
		const added = state.insertAlternativeSuggestions([
			"Seattle",
			"Portland",
			"San Diego",
		]);

		expect(added).toEqual(["Seattle", "Portland", "San Diego"]);
		expect(state.alternatives.current.map((item) => item.name)).toEqual([
			"Seattle",
			"Portland",
			"San Diego",
		]);
		expect(
			state.alternatives.current.every((item) => item.scores.length === 2),
		).toBe(true);
		expect(
			state.alternatives.current.every((item) => item.pairwise.length === 3),
		).toBe(true);
		expect(state.allocation.current.every((row) => row.length === 3)).toBe(
			true,
		);
	});

	it("appends criteria and updates scores, allocation, and weights", () => {
		const added = state.appendCriteria(["Schools", "Weather"]);

		expect(added).toEqual(["Schools", "Weather"]);
		expect(state.criteria.current.map((item) => item.name)).toEqual([
			"Criterion #1",
			"Criterion #2",
			"Schools",
			"Weather",
		]);
		expect(
			state.alternatives.current.every((item) => item.scores.length === 4),
		).toBe(true);
		expect(state.allocation.current.length).toBe(4);
		expect(state.allocation.current.every((row) => row.length === 2)).toBe(
			true,
		);
		expect(state.criteria.current.map((item) => item.weight)).toEqual([
			0.5, 0.5, 0, 0,
		]);
	});

	it("replaces untouched criteria defaults before appending AI suggestions", () => {
		const added = state.insertCriteriaSuggestions([
			"Cost",
			"Risk",
			"Long-term fit",
		]);

		expect(added).toEqual(["Cost", "Risk", "Long-term fit"]);
		expect(state.criteria.current.map((item) => item.name)).toEqual([
			"Cost",
			"Risk",
			"Long-term fit",
		]);
		expect(
			state.alternatives.current.every((item) => item.scores.length === 3),
		).toBe(true);
		expect(state.allocation.current.length).toBe(3);
		expect(state.allocation.current.every((row) => row.length === 2)).toBe(
			true,
		);
		expect(state.criteria.current.map((item) => item.weight)).toEqual([
			0.5, 0.5, 0,
		]);
	});

	it("exports snapshot state with all expected keys", () => {
		state.decision.current.notes = "Family friendly and within budget.";
		const snapshot = state.exportSnapshotState();

		expect(Object.keys(snapshot).sort()).toEqual([
			"allocation",
			"alternatives",
			"appMeta",
			"criteria",
			"decision",
			"methodMeta",
			"setupStepMeta",
		]);
		expect(Array.isArray(snapshot.criteria)).toBe(true);
		expect(Array.isArray(snapshot.alternatives)).toBe(true);
		expect(Array.isArray(snapshot.allocation)).toBe(true);
		expect(snapshot.decision.notes).toBe("Family friendly and within budget.");
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
			notes: "",
		});
		expect(state.criteria.current.length).toBe(2);
		expect(state.alternatives.current.length).toBe(2);
		expect(state.allocation.current.length).toBe(2);
		expect(state.isAppUsed("weigh")).toBe(false);
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
		expect(state.isAppUsed("weigh")).toBe(false);
		expect(state.isMethodUsed("weightedSum")).toBe(true);
		expect(state.isMethodUsed("pairwise")).toBe(false);
		expect(state.isSetupStepUsed("start")).toBe(true);
		expect(state.isSetupStepUsed("criteria")).toBe(false);
	});

	it("normalizes malformed persisted state", () => {
		state.decision.current.title = "Imported";
		Reflect.deleteProperty(state.decision.current, "goal");
		Reflect.deleteProperty(state.decision.current, "notes");
		state.criteria.current.splice(0, state.criteria.current.length);
		// @ts-expect-error simulate legacy persisted criteria data
		state.criteria.current.push({ weight: 0.7 }, { name: "Budget", weight: 2 });
		state.alternatives.current.splice(0, state.alternatives.current.length);
		// @ts-expect-error simulate legacy persisted alternative data
		state.alternatives.current.push(
			{ scores: [11], pairwise: [0.5, 1] },
			{ name: "Train", scores: [-5, 8], pairwise: [0, 0.5] },
		);
		state.allocation.current.splice(0, state.allocation.current.length, [60, 40]);

		state.syncPersistedState();

		expect(state.decision.current).toEqual({
			title: "Imported",
			goal: state.decisionDefaults.goal,
			notes: state.decisionDefaults.notes,
		});
		expect(state.criteria.current).toEqual([
			{ name: "Criterion #1", weight: 0.7 },
			{ name: "Budget", weight: 1 },
		]);
		expect(state.alternatives.current).toEqual([
			{ name: "Alternative #1", scores: [10, 5], pairwise: [0.5, 1] },
			{ name: "Train", scores: [0, 8], pairwise: [0, 0.5] },
		]);
		expect(state.allocation.current).toHaveLength(2);
		expect(state.allocation.current.every((row) => row.length === 2)).toBe(true);
		expect(
			state.allocation.current.every((row) => {
				return Math.abs(row.reduce((a, b) => a + b, 0) - 100) < 0.001;
			}),
		).toBe(true);
	});

	it("cleans legacy rank storage on load", async () => {
		window.localStorage.setItem("rankOrder", JSON.stringify([1, 0]));
		window.localStorage.setItem(
			"appMeta",
			JSON.stringify({
				weigh: { used: true },
				score: { used: false },
				compare: { used: true },
				rank: { used: true },
				allocate: { used: false },
			}),
		);
		window.localStorage.setItem(
			"methodMeta",
			JSON.stringify({
				weightedSum: { used: true, included: true },
				pairwise: { used: false, included: false },
				rankOrder: { used: true, included: true },
				topsis: { used: false, included: false },
				allocate: { used: false, included: false },
			}),
		);

		vi.resetModules();
		state = await import("$lib/state");

		expect(window.localStorage.getItem("rankOrder")).toBeNull();
		expect(window.localStorage.getItem("appMeta")).not.toContain("rank");
		expect(window.localStorage.getItem("methodMeta")).not.toContain(
			"rankOrder",
		);
	});
});

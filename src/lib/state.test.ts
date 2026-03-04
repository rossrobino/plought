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
});

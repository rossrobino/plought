<script lang="ts">
	import Info from "$lib/components/info.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	import { alternatives, markAppUsed, markMethodUsed } from "$lib/state";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import ShuffleIcon from "@lucide/svelte/icons/shuffle";

	interface Pair {
		a: number;
		b: number;
		left: number;
		right: number;
	}

	let pairs = $state<Pair[]>([]);
	let current = $state(0);
	let shapeKey = $state("");
	let touched = $state<Record<string, true>>({});

	const pairId = ({ a, b }: Pair) => {
		return `${a}:${b}`;
	};

	const pairShapeKey = () => {
		return alternatives.current.map(({ name }) => name).join("\u0000");
	};

	const shuffle = <T,>(list: T[]) => {
		const next = [...list];
		for (let i = next.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[next[i], next[j]] = [next[j], next[i]];
		}
		return next;
	};

	const createPairs = (count: number) => {
		const base: Pair[] = [];
		for (let i = 0; i < count; i++) {
			for (let j = i + 1; j < count; j++) {
				base.push({ a: i, b: j, left: i, right: j });
			}
		}
		return shuffle(base).map((pair) => {
			if (Math.random() < 0.5) {
				return pair;
			}
			return { ...pair, left: pair.b, right: pair.a };
		});
	};

	const createTouched = (nextPairs: Pair[]) => {
		const next: Record<string, true> = {};
		for (const pair of nextPairs) {
			const value = alternatives.current[pair.a]?.pairwise?.[pair.b];
			if (value === 0 || value === 1) {
				next[pairId(pair)] = true;
			}
		}
		return next;
	};

	const buildDeck = () => {
		const count = alternatives.current.length;
		pairs = createPairs(count);
		touched = createTouched(pairs);
		current = 0;
	};

	$effect(() => {
		const nextKey = `${alternatives.current.length}:${pairShapeKey()}`;
		if (nextKey === shapeKey) {
			if (current >= pairs.length && pairs.length > 0) {
				current = pairs.length - 1;
			}
			if (pairs.length === 0) {
				current = 0;
			}
			return;
		}
		shapeKey = nextKey;
		buildDeck();
	});

	const totalPairs = $derived(pairs.length);
	const activePair = $derived(totalPairs > 0 ? pairs[current] : null);
	const canGoPrev = $derived(current > 0);
	const canGoNext = $derived(current < totalPairs - 1);
	const answered = $derived(
		pairs.reduce((sum, pair) => {
			return sum + (touched[pairId(pair)] ? 1 : 0);
		}, 0),
	);
	const progressValue = $derived(
		totalPairs <= 0 ? 0 : (answered / totalPairs) * 100,
	);

	const getChoice = (pair: Pair | null) => {
		if (pair == null || !touched[pairId(pair)]) {
			return null;
		}
		const value = alternatives.current[pair.a]?.pairwise?.[pair.b];
		if (value === 0.5) {
			return "tie";
		}
		const winner = value === 1 ? pair.a : pair.b;
		return winner === pair.left ? "left" : "right";
	};

	const select = (choice: "left" | "right" | "tie") => {
		const pair = activePair;
		if (pair == null) {
			return;
		}
		const i = pair.a;
		const j = pair.b;
		const value =
			choice === "tie"
				? 0.5
				: choice === "left"
					? pair.left === i
						? 1
						: 0
					: pair.right === i
						? 1
						: 0;
		alternatives.current[i].pairwise[j] = value;
		alternatives.current[j].pairwise[i] =
			value === 1 ? 0 : value === 0 ? 1 : 0.5;
		touched = { ...touched, [pairId(pair)]: true };
		markAppUsed("compare");
		markMethodUsed("pairwise");
		if (current < totalPairs - 1) {
			current += 1;
		}
	};

	const go = (direction: -1 | 1) => {
		if (direction < 0 && canGoPrev) {
			current -= 1;
			return;
		}
		if (direction > 0 && canGoNext) {
			current += 1;
		}
	};
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Comparisons</h2>
		<Info label="About comparisons">
			<div class="space-y-2">
				<p>Compare each alternative against every other alternative.</p>
				<p>
					Each pair is shown in randomized order to reduce position bias. Pick
					the option you prefer, or select Tie.
				</p>
			</div>
		</Info>
	</div>
	<p class="mt-2 text-sm text-muted-foreground">
		Review one pair at a time. Order is shuffled each session.
	</p>

	{#if alternatives.current.length < 2}
		<div class="mt-3 rounded-lg border bg-muted/25 p-3 shadow-xs">
			<p class="mb-0 text-sm text-muted-foreground">
				Add at least two alternatives to run pairwise comparisons.
			</p>
			<div class="mt-3">
				<Button href="/setup/alternatives" size="sm" variant="outline">
					Setup alternatives
				</Button>
			</div>
		</div>
	{:else}
		<div class="mt-3 rounded-lg border bg-muted/25 p-3 shadow-xs">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<p class="mb-0 text-sm text-muted-foreground">
					Pair {totalPairs > 0 ? current + 1 : 0} of {totalPairs}
				</p>
				<p class="mb-0 text-sm text-muted-foreground">
					Answered {answered} / {totalPairs}
				</p>
			</div>
			<Progress class="mt-2" value={progressValue} />
		</div>

		{#if activePair != null}
			{@const choice = getChoice(activePair)}
			<div class="mt-3 rounded-lg border bg-card p-4 shadow-xs">
				<div class="grid gap-2 sm:grid-cols-3">
					<Button
						variant={choice === "left" ? "secondary" : "outline"}
						size="default"
						onclick={() => select("left")}
						class="min-w-0 text-base"
					>
						<span class="block truncate">
							{alternatives.current[activePair.left]?.name ?? "Alternative"}
						</span>
					</Button>
					<Button
						variant={choice === "tie" ? "secondary" : "outline"}
						size="default"
						onclick={() => select("tie")}
						class="text-base"
					>
						Tie
					</Button>
					<Button
						variant={choice === "right" ? "secondary" : "outline"}
						size="default"
						onclick={() => select("right")}
						class="min-w-0 text-base"
					>
						<span class="block truncate">
							{alternatives.current[activePair.right]?.name ?? "Alternative"}
						</span>
					</Button>
				</div>
			</div>
		{/if}

		<div class="mt-3 flex flex-wrap items-center justify-between gap-2">
			<div class="inline-flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={!canGoPrev}
					onclick={() => go(-1)}
				>
					<ArrowLeftIcon />
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!canGoNext}
					onclick={() => go(1)}
				>
					Next
					<ArrowRightIcon />
				</Button>
			</div>
			<Button variant="outline" size="sm" onclick={buildDeck}>
				<ShuffleIcon />
				Reshuffle
			</Button>
		</div>
	{/if}
</section>

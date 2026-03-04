<script lang="ts">
	import Info from "$lib/components/Info.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import {
		allocation,
		alternatives,
		criteria,
		markMethodUsed,
	} from "$lib/state";
	import { allocationTotal, splitEven } from "$lib/util/allocate";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import PlusIcon from "@lucide/svelte/icons/plus";

	let criterionIndex = $state(0);

	$effect(() => {
		const count = criteria.current.length;
		if (count <= 0) {
			if (criterionIndex !== 0) {
				criterionIndex = 0;
			}
			return;
		}
		const bounded = Math.max(0, Math.min(criterionIndex, count - 1));
		if (bounded !== criterionIndex) {
			criterionIndex = bounded;
		}
	});

	const hasInputs = $derived(
		criteria.current.length > 0 && alternatives.current.length > 0,
	);
	const clampPoints = (value: number) => {
		return Math.max(0, Math.min(allocationTotal, value));
	};

	const normalizePoints = (values: number[], target = allocationTotal) => {
		const count = values.length;
		if (count === 0) {
			return [];
		}
		if (target <= 0) {
			return new Array(count).fill(0);
		}
		const positive = values.map((value) => Math.max(0, value));
		const sum = positive.reduce((a, b) => a + b, 0);
		if (sum <= 0) {
			return splitEven(count, target);
		}
		return positive.map((value) => (value / sum) * target);
	};

	const getCurrentRow = () => {
		const count = alternatives.current.length;
		if (count <= 0) {
			return [];
		}
		const row = allocation.current[criterionIndex] ?? [];
		return normalizePoints(
			Array.from({ length: count }, (_, i) => {
				return row[i] ?? 0;
			}),
		);
	};

	const criterionRow = $derived.by(() => {
		return getCurrentRow();
	});
	const currentCriterion = $derived(criteria.current[criterionIndex] ?? null);
	const canGoPrev = $derived(criterionIndex > 0);
	const canGoNext = $derived(criterionIndex < criteria.current.length - 1);

	const updateCriterion = (value: string) => {
		const next = Number(value);
		if (!Number.isInteger(next)) {
			return;
		}
		criterionIndex = Math.max(0, Math.min(next, criteria.current.length - 1));
	};

	const setPoints = (altIndex: number, value: number) => {
		if (!hasInputs) {
			return;
		}
		const current = getCurrentRow();
		const nextValue = clampPoints(value);
		if (Math.abs((current[altIndex] ?? 0) - nextValue) < 0.000001) {
			return;
		}
		if (current.length <= 1) {
			allocation.current[criterionIndex] = [allocationTotal];
			markMethodUsed("allocate");
			return;
		}

		const otherIndices = current.map((_, i) => i).filter((i) => i !== altIndex);
		const targetOthers = allocationTotal - nextValue;
		const next = [...current];
		next[altIndex] = nextValue;

		if (targetOthers <= 0) {
			otherIndices.forEach((i) => {
				next[i] = 0;
			});
		} else {
			const redistributed = normalizePoints(
				otherIndices.map((i) => current[i]),
				targetOthers,
			);
			otherIndices.forEach((item, i) => {
				next[item] = redistributed[i];
			});
		}

		allocation.current[criterionIndex] = next;
		markMethodUsed("allocate");
	};

	const nudgePoints = (altIndex: number, direction: -1 | 1) => {
		const current = criterionRow[altIndex] ?? 0;
		setPoints(altIndex, current + direction);
	};

	const formatPoints = (value: number) => {
		if (!Number.isFinite(value)) {
			return "0";
		}
		return value.toFixed(2).replace(/\.?0+$/, "");
	};

	const evenSplitCriterion = () => {
		if (!hasInputs) {
			return;
		}
		allocation.current[criterionIndex] = splitEven(alternatives.current.length);
		markMethodUsed("allocate");
	};
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Allocate</h2>
		<Info label="About allocation">
			<div class="space-y-2">
				<p>
					For each criterion, distribute exactly {allocationTotal} points across all
					alternatives.
				</p>
				<p>
					Higher points mean stronger preference for that criterion. Scores are
					combined with criterion weights in analysis.
				</p>
			</div>
		</Info>
	</div>
	<p class="mt-2 text-sm text-muted-foreground">
		Allocate points by criterion to express relative tradeoffs between
		alternatives.
	</p>

	{#if !hasInputs}
		<div class="mt-3 rounded-lg border bg-muted/25 p-3 shadow-xs">
			<p class="mb-0 text-sm text-muted-foreground">
				Add at least one criterion and one alternative to start allocating
				points.
			</p>
			<div class="mt-3 flex flex-wrap gap-2">
				<Button href="/setup/criteria" size="sm" variant="outline">
					Setup criteria
				</Button>
				<Button href="/setup/alternatives" size="sm" variant="outline">
					Setup alternatives
				</Button>
			</div>
		</div>
	{:else}
		<div class="mt-3 rounded-lg border bg-muted/25 p-3 shadow-xs">
			<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
				<div class="min-w-0">
					<p class="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
						Criterion
					</p>
					<Select.Root
						type="single"
						value={`${criterionIndex}`}
						onValueChange={updateCriterion}
					>
						<Select.Trigger class="h-8 w-full justify-between">
							{currentCriterion?.name ?? "Criterion"}
						</Select.Trigger>
						<Select.Content>
							{#each criteria.current as item, i (`criterion-${i}`)}
								<Select.Item value={`${i}`}>{item.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex items-end gap-2">
					<Button size="sm" variant="outline" onclick={evenSplitCriterion}>
						Even split criterion
					</Button>
				</div>
			</div>

			<div class="mt-3 inline-flex gap-2">
				<Button
					size="sm"
					variant="outline"
					disabled={!canGoPrev}
					onclick={() => (criterionIndex -= 1)}
				>
					Previous
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={!canGoNext}
					onclick={() => (criterionIndex += 1)}
				>
					Next
				</Button>
			</div>
		</div>

		<div class="mt-3 grid gap-2">
			{#each alternatives.current as alt, i (`alt-${i}-${alt.name}`)}
				<div class="rounded-lg border bg-card p-3 shadow-xs">
					<div class="flex items-center justify-between gap-2">
						<p class="mb-0 font-medium">{alt.name}</p>
						<p class="mb-0 text-sm text-muted-foreground">
							{formatPoints(criterionRow[i] ?? 0)} pts
						</p>
					</div>
					<div class="mt-2 flex items-center gap-2">
						<Button
							variant="secondary"
							size="icon-sm"
							onclick={() => nudgePoints(i, -1)}
							aria-label={`Decrease points for ${alt.name}`}
						>
							<MinusIcon class="size-3.5" />
						</Button>
						<Slider
							id={`allocation-${criterionIndex}-${i}`}
							min={0}
							max={allocationTotal}
							step={0.01}
							value={criterionRow[i] ?? 0}
							onValueChange={(value) => setPoints(i, value)}
						/>
						<Button
							variant="secondary"
							size="icon-sm"
							onclick={() => nudgePoints(i, 1)}
							aria-label={`Increase points for ${alt.name}`}
						>
							<PlusIcon class="size-3.5" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

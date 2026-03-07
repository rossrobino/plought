<script lang="ts">
	import { generateAllocateResearch } from "$lib/ai/research.remote";
	import type {
		AllocateResearchRequest,
		AllocateResearchResult,
		ScoreResearchResult,
	} from "$lib/ai/types";
	import ResearchPanel from "$lib/components/ai/research-panel.svelte";
	import Info from "$lib/components/info.svelte";
	import { Button } from "$lib/components/ui/button";
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import SectionHeader from "$lib/components/ui/section-header.svelte";
	import * as Select from "$lib/components/ui/select";
	import { Slider } from "$lib/components/ui/slider";
	import {
		allocation,
		alternatives,
		criteria,
		decision,
		isAlternativePlaceholder,
		isCriteriaPlaceholder,
		markAppUsed,
		markMethodUsed,
	} from "$lib/state";
	import {
		allocationTotal,
		normalizeAllocationRow,
		rebalanceAllocationRow,
		splitEven,
	} from "$lib/util/allocate";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import { tick } from "svelte";

	let criterionIndex = $state(0);
	let showResearch = $state(false);
	let research = $state<HTMLDivElement | null>(null);

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

	const getCurrentRow = () => {
		const count = alternatives.current.length;
		if (count <= 0) {
			return [];
		}
		return normalizeAllocationRow(
			allocation.current[criterionIndex],
			count,
			allocationTotal,
		);
	};

	const criterionRow = $derived.by(() => {
		return getCurrentRow();
	});
	const currentCriterion = $derived(criteria.current[criterionIndex] ?? null);
	const canGoPrev = $derived(criterionIndex > 0);
	const canGoNext = $derived(criterionIndex < criteria.current.length - 1);
	const target = $derived(
		currentCriterion?.name ?? "Choose a criterion to research",
	);
	const targetKey = $derived(`allocate:${criterionIndex}:${target}`);
	const message = $derived.by(() => {
		if (currentCriterion == null) {
			return "Choose a criterion to research.";
		}
		if (isCriteriaPlaceholder(currentCriterion.name)) {
			return "Rename this criterion before researching it.";
		}
		if (
			alternatives.current.some((item) => isAlternativePlaceholder(item.name))
		) {
			return "Rename every alternative before researching this allocation.";
		}
		if (alternatives.current.length < 2) {
			return "Add at least two alternatives before researching this allocation.";
		}
		return "";
	});
	const canGenerate = $derived(message.length === 0);

	const scrollResearch = async () => {
		await tick();
		research?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

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
		const next = rebalanceAllocationRow(
			current,
			altIndex,
			value,
			allocationTotal,
		);
		if (
			current.length === next.length &&
			next.every((item, i) => Math.abs(item - (current[i] ?? 0)) < 0.000001)
		) {
			return;
		}

		allocation.current[criterionIndex] = next;
		markAppUsed("allocate");
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
		markAppUsed("allocate");
		markMethodUsed("allocate");
	};

	const openResearch = async () => {
		showResearch = true;
		await scrollResearch();
	};

	const createRequest = (context: string): AllocateResearchRequest => {
		return {
			title: decision.current.title,
			goal: decision.current.goal,
			context,
			criterion: currentCriterion?.name ?? "",
			existingAlternatives: alternatives.current.map((item) => item.name),
			existingCriteria: criteria.current.map((item) => item.name),
			requestId: crypto.randomUUID(),
		};
	};

	const load = (input: AllocateResearchRequest) => {
		return generateAllocateResearch(input);
	};

	const apply = (result: AllocateResearchResult | ScoreResearchResult) => {
		if (!("suggestedPoints" in result) || alternatives.current.length === 0) {
			return;
		}

		const points = new Map(
			result.suggestedPoints.map((item) => [
				item.alternative.trim().replace(/\s+/g, " ").toLocaleLowerCase(),
				item.points,
			]),
		);
		allocation.current[criterionIndex] = normalizeAllocationRow(
			alternatives.current.map((item) => {
				return (
					points.get(
						item.name.trim().replace(/\s+/g, " ").toLocaleLowerCase(),
					) ?? 0
				);
			}),
			alternatives.current.length,
			allocationTotal,
		);
		markAppUsed("allocate");
		markMethodUsed("allocate");
	};
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<div class="min-w-0 flex-1">
			<SectionHeader
				title="Allocate"
				desc="Allocate points by criterion to express relative tradeoffs between alternatives."
				descClass="text-sm"
			/>
		</div>
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
					<Eyebrow variant="subtle" class="mb-1">Criterion</Eyebrow>
					<Select.Root
						type="single"
						value={`${criterionIndex}`}
						onValueChange={updateCriterion}
					>
						<Select.Trigger
							class="h-8 w-full justify-between"
							aria-label="Criterion"
						>
							{currentCriterion?.name ?? "Criterion"}
						</Select.Trigger>
						<Select.Content>
							{#each criteria.current as item, i (`criterion-${i}`)}
								<Select.Item value={`${i}`}>{item.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex flex-wrap items-end gap-2">
					<Button size="sm" variant="outline" onclick={openResearch}>
						Research this criterion
					</Button>
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
							label={`Points for ${alt.name}`}
							text={`${formatPoints(criterionRow[i] ?? 0)} points for ${currentCriterion?.name ?? "criterion"}`}
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

{#if hasInputs && showResearch}
	<div bind:this={research}>
		{#key targetKey}
			<ResearchPanel
				{canGenerate}
				{message}
				{target}
				{createRequest}
				desc="Get a suggested point split, short reasons, and source links for this criterion."
				hint="Optional: tradeoffs, constraints, or anything not already captured."
				{load}
				mode="allocate"
				onApply={apply}
			/>
		{/key}
	</div>
{/if}

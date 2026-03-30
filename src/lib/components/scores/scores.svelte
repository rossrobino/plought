<script lang="ts">
	import Info from "$lib/components/info.svelte";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import SectionHeader from "$lib/components/ui/section-header.svelte";
	import * as Table from "$lib/components/ui/table";
	import { allocation, alternatives, criteria } from "$lib/state";
	import { getAllocateScores, normalizeAllocation } from "$lib/util/allocate";
	import { getTopsisCloseness } from "$lib/util/topsis";

	type SortBy = "" | "weightedSum" | "pairwise" | "allocate" | "topsis";

	interface Props {
		allocate?: boolean;
		pairwise?: boolean;
		sortBy?: SortBy;
		topsis?: boolean;
		weightedSum?: boolean;
	}

	let {
		weightedSum = false,
		pairwise = false,
		allocate = false,
		topsis = false,
		sortBy = "",
	}: Props = $props();

	const topsisScoreByAlternativeIndex = $derived(
		getTopsisCloseness(alternatives.current, criteria.current).map((value) =>
			Number((value * 10).toFixed(2)),
		),
	);
	const allocationMatrix = $derived(
		normalizeAllocation(
			Array.isArray(allocation.current) ? allocation.current : [],
			criteria.current.length,
			alternatives.current.length,
		),
	);
	const allocateScoreByAlternativeIndex = $derived(
		getAllocateScores(allocationMatrix, criteria.current),
	);

	const weightedSumScoreByAlternativeIndex = $derived(
		alternatives.current.map((alt) => {
			let total = 0;
			for (let i = 0; i < criteria.current.length; i++) {
				total += (criteria.current[i]?.weight ?? 0) * (alt.scores[i] ?? 0);
			}
			return Number(total.toFixed(2));
		}),
	);
	const pairwiseScoreByAlternativeIndex = $derived(
		alternatives.current.map((alt, skipIndex) => {
			let total = 0;
			for (let i = 0; i < alt.pairwise.length; i++) {
				if (i !== skipIndex) {
					total += alt.pairwise[i] ?? 0;
				}
			}
			return total;
		}),
	);
	const sortByScoreByIndex = $derived.by(() => {
		if (sortBy === "weightedSum") {
			return weightedSumScoreByAlternativeIndex;
		}
		if (sortBy === "pairwise") {
			return pairwiseScoreByAlternativeIndex;
		}
		if (sortBy === "allocate") {
			return allocateScoreByAlternativeIndex;
		}
		if (sortBy === "topsis") {
			return topsisScoreByAlternativeIndex;
		}
		return null;
	});

	const sortedAlternatives = $derived(
		alternatives.current
			.map((alt, i) => ({ alt, i }))
			.sort((a, b) => {
				if (sortByScoreByIndex == null) {
					return a.i - b.i;
				}
				return (sortByScoreByIndex[b.i] ?? 0) - (sortByScoreByIndex[a.i] ?? 0);
			}),
	);
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<SectionHeader title="Scores" class="min-w-0 flex-1" />
		<Info label="About scores">
			<div class="space-y-2">
				{#if weightedSum && !pairwise && !allocate && !topsis}
					<p>
						Each alternative score is multiplied by its criterion weight, then
						those values are summed.
					</p>
				{:else if pairwise && !weightedSum && !allocate && !topsis}
					<p>
						Each row is scored from head-to-head comparisons: Preferred = +1,
						Tie = +0.5, Unfavored = 0.
					</p>
				{:else if allocate && !weightedSum && !pairwise && !topsis}
					<p>
						Allocate scores come from per-criterion point splits across
						alternatives, combined with criterion weights.
					</p>
				{:else if topsis && !weightedSum && !pairwise && !allocate}
					<p>
						TOPSIS ranks alternatives by closeness to the ideal option and
						distance from the worst option using weighted normalized scores.
					</p>
				{:else}
					<p>
						{#if weightedSum}
							Weighted Sum uses criteria weights.
						{/if}
						{#if pairwise}
							Pairwise uses head-to-head preferences.
						{/if}
						{#if allocate}
							Allocate converts criterion point splits into weighted 0-10
							scores.
						{/if}
						{#if topsis}
							TOPSIS uses distance to ideal and anti-ideal profiles.
						{/if}
					</p>
					<p>
						Use this table to compare rankings across enabled scoring methods.
					</p>
				{/if}
			</div>
		</Info>
	</div>
	{#if sortedAlternatives.length === 0}
		<div
			class="mt-3 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground shadow-xs"
		>
			Add alternatives to see scores.
		</div>
	{:else}
		<ScrollArea
			class="mt-3 w-full rounded-md border whitespace-nowrap"
			orientation="horizontal"
		>
			<Table.Root class="min-w-full">
				<caption class="sr-only">Method scores for each alternative.</caption>
				<Table.Header>
					<Table.Row
						class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent"
					>
						<Table.Head>Alternative</Table.Head>
						{#if weightedSum}
							<Table.Head>Weighted Sum</Table.Head>
						{/if}
						{#if pairwise}
							<Table.Head>Pairwise</Table.Head>
						{/if}
						{#if allocate}
							<Table.Head>Allocate</Table.Head>
						{/if}
						{#if topsis}
							<Table.Head>TOPSIS</Table.Head>
						{/if}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each sortedAlternatives as item (`${item.i}-${item.alt.name}`)}
						<Table.Row>
							<Table.Head scope="row" class="font-semibold">
								{item.alt.name}
							</Table.Head>
							{#if weightedSum}
								<Table.Cell class="font-semibold">
									{weightedSumScoreByAlternativeIndex[item.i] ?? 0}
								</Table.Cell>
							{/if}
							{#if pairwise}
								<Table.Cell class="font-semibold">
									{pairwiseScoreByAlternativeIndex[item.i] ?? 0}
								</Table.Cell>
							{/if}
							{#if allocate}
								<Table.Cell class="font-semibold">
									{allocateScoreByAlternativeIndex[item.i] ?? 0}
								</Table.Cell>
							{/if}
							{#if topsis}
								<Table.Cell class="font-semibold">
									{topsisScoreByAlternativeIndex[item.i] ?? 0}
								</Table.Cell>
							{/if}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
	{/if}
</section>

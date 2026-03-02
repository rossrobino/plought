<script lang="ts">
	import Info from "$lib/components/Info.svelte";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import {
		alternatives,
		criteria,
		getRankScore,
		normalizeRankOrder,
		rankOrder as rankOrderState,
	} from "$lib/state";
	import type { Alternative, Criteria } from "$lib/types";

	type SortBy = "" | "weightedSum" | "pairwise" | "rankOrder";

	interface Props {
		pairwise?: boolean;
		rankOrder?: boolean;
		sortBy?: SortBy;
		weightedSum?: boolean;
	}

	let {
		weightedSum = false,
		pairwise = false,
		rankOrder = false,
		sortBy = "",
	}: Props = $props();

	const normalizedRankOrder = $derived(
		normalizeRankOrder(
			Array.isArray(rankOrderState.current) ? rankOrderState.current : [],
			alternatives.current.length,
		),
	);

	const rankByAlternativeIndex = $derived.by(() => {
		const map = new Map<number, number>();
		normalizedRankOrder.forEach((altIndex, rank) => {
			map.set(altIndex, rank);
		});
		return map;
	});

	const sortedAlternatives = $derived(
		alternatives.current
			.map((alt, i) => ({ alt, i }))
			.sort((a, b) => {
				if (sortBy === "weightedSum") {
					return (
						getWeightedSum(b.alt, criteria.current) -
						getWeightedSum(a.alt, criteria.current)
					);
				} else if (sortBy === "pairwise") {
					return getPairwiseScore(b.i) - getPairwiseScore(a.i);
				} else if (sortBy === "rankOrder") {
					return getRankOrderScore(b.i) - getRankOrderScore(a.i);
				} else {
					return a.i - b.i;
				}
			}),
	);

	/**
	 * Calculates the weighted sum score of an alternative
	 *
	 * @param alt - alternative
	 * @param criteria - array of criteria
	 */
	const getWeightedSum = (alt: Alternative, criteria: Criteria[]): number => {
		// get the current weights of each criteria
		const weights = criteria.map(({ weight }) => {
			return weight;
		});

		// multiply each score by its corresponding weight
		const weighted = [];
		for (let i = 0; i < weights.length; i++) {
			weighted.push(weights[i] * alt.scores[i]);
		}

		// sum the list to create the total score
		const total = weighted.reduce(
			(accumulator, currentValue) => accumulator + currentValue,
			0,
		);
		return Number(total.toFixed(2));
	};

	/**
	 * Calculates the pairwise score of an alternative
	 *
	 * @param alt - alternative
	 * @returns pairwise score
	 */
	const getPairwiseScore = (skipIndex: number) => {
		const alt = alternatives.current[skipIndex];
		if (alt == null) {
			return 0;
		}

		// sum all pairwise scores besides the index
		let total = 0;
		alt.pairwise.forEach((score, i) => {
			if (i !== skipIndex) {
				total += score;
			}
		});

		return total;
	};

	const getRankOrderScore = (altIndex: number) => {
		const count = alternatives.current.length;
		const rank = rankByAlternativeIndex.get(altIndex);
		return getRankScore(rank == null ? count - 1 : rank, count);
	};
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Scores</h2>
		<Info label="About scores">
			<div class="space-y-2">
				{#if weightedSum && !pairwise}
					<p>
						Each alternative score is multiplied by its criterion weight, then
						those values are summed.
					</p>
				{:else if pairwise && !weightedSum}
					<p>
						Each row is scored from head-to-head comparisons: Preferred = +1,
						Tie = +0.5, Unfavored = 0.
					</p>
				{:else if rankOrder && !weightedSum && !pairwise}
					<p>
						Order alternatives from most to least preferred. Scores are
						normalized from 0 to 10 based on rank position.
					</p>
				{:else}
					<p>
						{#if weightedSum}
							Weighted Sum uses criteria weights.
						{/if}
						{#if pairwise}
							Pairwise uses head-to-head preferences.
						{/if}
						{#if rankOrder}
							Rank Order converts list position into a 0-10 score.
						{/if}
					</p>
					<p>
						Use this table to compare rankings across enabled scoring methods.
					</p>
				{/if}
			</div>
		</Info>
	</div>
	<ScrollArea
		class="mt-3 w-full rounded-md border whitespace-nowrap"
		orientation="horizontal"
	>
		<Table.Root class="min-w-full">
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
					{#if rankOrder}
						<Table.Head>Rank Order</Table.Head>
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
								{getWeightedSum(item.alt, criteria.current)}
							</Table.Cell>
						{/if}
						{#if pairwise}
							<Table.Cell class="font-semibold">
								{getPairwiseScore(item.i)}
							</Table.Cell>
						{/if}
						{#if rankOrder}
							<Table.Cell class="font-semibold">
								{getRankOrderScore(item.i)}
							</Table.Cell>
						{/if}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</ScrollArea>
</section>

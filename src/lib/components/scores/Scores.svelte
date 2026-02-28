<script lang="ts">
	import Info from "$lib/components/Info.svelte";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { alternatives, criteria } from "$lib/state";
	import type { Alternative, Criteria } from "$lib/types";

	type SortBy = "" | "weightedSum" | "pairwise";

	interface Props {
		pairwise?: boolean;
		sortBy?: SortBy;
		weightedSum?: boolean;
	}

	let { weightedSum = false, pairwise = false, sortBy = "" }: Props = $props();

	const sortedAlternatives = $derived(
		[...alternatives.current].sort((a, b) => {
			if (sortBy === "weightedSum") {
				return (
					getWeightedSum(b, criteria.current) -
					getWeightedSum(a, criteria.current)
				);
			} else if (sortBy === "pairwise") {
				return getPairwiseScore(b) - getPairwiseScore(a);
			} else {
				return 1;
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
	const getPairwiseScore = (alt: Alternative) => {
		// find index of alt
		const skipIndex = alternatives.current.indexOf(alt);

		// sum all pairwise scores besides the index
		let total = 0;
		alt.pairwise.forEach((score, i) => {
			if (i !== skipIndex) {
				total += score;
			}
		});

		return total;
	};
</script>

<section>
	<div class="flex items-center justify-between gap-2">
		<h2 class="mb-0">Scores</h2>
		<Info label="About scores">
			<div class="space-y-2">
				{#if weightedSum && !pairwise}
					<p>
						Each alternative score is multiplied by its criterion weight, then those
						values are summed.
					</p>
				{:else if pairwise && !weightedSum}
					<p>
						Each row is scored from head-to-head comparisons:
						Preferred = +1, Tie = +0.5, Unfavored = 0.
					</p>
				{:else}
					<p>
						Weighted Sum uses criteria weights; Pairwise uses head-to-head
						preferences.
					</p>
					<p>
						Use this table to compare rankings across both scoring methods.
					</p>
				{/if}
			</div>
		</Info>
	</div>
	<ScrollArea class="mt-3 w-full whitespace-nowrap rounded-md border" orientation="horizontal">
		<Table.Root class="min-w-full">
			<Table.Header>
				<Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
					<Table.Head>Alternative</Table.Head>
					{#if weightedSum}
						<Table.Head>Weighted Sum</Table.Head>
					{/if}
					{#if pairwise}
						<Table.Head>Pairwise</Table.Head>
					{/if}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each sortedAlternatives as alt (alt.name)}
					<Table.Row>
						<Table.Cell>{alt.name}</Table.Cell>
						{#if weightedSum}
							<Table.Cell class="font-semibold">
								{getWeightedSum(alt, criteria.current)}
							</Table.Cell>
						{/if}
						{#if pairwise}
							<Table.Cell class="font-semibold">{getPairwiseScore(alt)}</Table.Cell>
						{/if}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</ScrollArea>
</section>

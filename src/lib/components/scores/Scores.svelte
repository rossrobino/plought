<script lang="ts">
	import { alternatives, criteria } from "$lib/stores";
	import type { Alternative, Criteria } from "$lib/types";

	export let weightedSum = false;
	export let pairwise = false;

	type SortBy = "" | "weightedSum" | "pairwise";
	export let sortBy: SortBy = "";

	let sortedAlternatives: Alternative[];
	$: sortedAlternatives = [...$alternatives].sort((a, b) => {
		if (sortBy === "weightedSum") {
			return getWeightedSum(b, $criteria) - getWeightedSum(a, $criteria);
		} else if (sortBy === "pairwise") {
			return getPairwiseScore(b) - getPairwiseScore(a);
		} else {
			return 1;
		}
	});

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
		const skipIndex = $alternatives.indexOf(alt);

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
	<h2>Scores</h2>
	<div class="mt-4 overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th>Alternative</th>
					{#if weightedSum}
						<th>Weighted Sum</th>
					{/if}
					{#if pairwise}
						<th>Pairwise</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each sortedAlternatives as alt}
					<tr>
						<td>{alt.name}</td>
						{#if weightedSum}
							<td class="font-bold">{getWeightedSum(alt, $criteria)}</td>
						{/if}
						{#if pairwise}
							<td class="font-bold">{getPairwiseScore(alt)}</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

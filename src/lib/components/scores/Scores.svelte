<script lang="ts">
	import { alternatives } from "$lib/stores";
	import { getPairwiseScore, getWeightedSum } from "$lib/util/alternative";

	export let weightedSum = false;
	export let pairwise = false;

	type SortBy = "" | "weightedSum" | "pairwise";
	export let sortBy: SortBy = "";

	let sortedAlternatives: Alternative[];
	$: sortedAlternatives = [...$alternatives].sort((a, b) => {
		if (sortBy === "weightedSum") {
			return getWeightedSum(b) - getWeightedSum(a);
		} else if (sortBy === "pairwise") {
			return getPairwiseScore(b) - getPairwiseScore(a);
		} else {
			return 1;
		}
	});
</script>

<section>
	<h2>Scores</h2>
	<div class="overflow-x-auto">
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
							<td class="font-bold">{getWeightedSum(alt)}</td>
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

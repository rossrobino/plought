<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";

	let sortedAlternatives: Alternative[];
	$: sortedAlternatives = [...$alternatives].sort((a, b) => {
		return scoreWeightedSum(b.scores) - scoreWeightedSum(a.scores);
	});

	/**
	 * Takes the weights of each criteria and the scores of an item,
	 * multiplies them together, and sums the list, returns total score
	 *
	 * @param scores - list of scores for a particular item
	 */
	const scoreWeightedSum = (scores: number[]): number => {
		const weights = $criteria.map(({ weight }) => {
			return weight;
		});
		const weighted = [];
		for (let i = 0; i < weights.length; i++) {
			weighted.push(weights[i] * scores[i]);
		}
		const total = weighted.reduce(
			(accumulator, currentValue) => accumulator + currentValue,
			0,
		);
		return Number(total.toFixed(2));
	};
</script>

<section>
	<h2>Score</h2>
	<table>
		<thead>
			<th>Alternative</th>
			<th>Score</th>
		</thead>
		<tbody>
			{#each sortedAlternatives as alt}
				<tr>
					<td>{alt.name}</td>
					<td class="font-bold">{scoreWeightedSum(alt.scores)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

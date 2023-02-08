<script lang="ts">
	import { alternatives } from "$lib/stores";
	import { getWeightedSum } from "$lib/util/alternative";

	let sortedAlternatives: Alternative[];
	$: sortedAlternatives = [...$alternatives].sort((a, b) => {
		return getWeightedSum(b) - getWeightedSum(a);
	});
</script>

<section>
	<h2>Scores</h2>
	<table>
		<thead>
			<th>Alternative</th>
			<th>Weighted Sum</th>
		</thead>
		<tbody>
			{#each sortedAlternatives as alt}
				<tr>
					<td>{alt.name}</td>
					<td class="font-bold">{getWeightedSum(alt)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

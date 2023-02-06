<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";
	import XMark from "$lib/svg/XMark.svelte";

	const addAlternative = () => {
		const scores: number[] = new Array($criteria.length).fill(0);
		$alternatives.push({ name: "Alternative", scores });
		$alternatives = $alternatives;
	};

	const removeAlternative = (index: number) => {
		$alternatives.splice(index, 1);
		$alternatives = $alternatives;
	};

	/**
	 * Checks if the number of scores for each item match
	 * the number of criteria.
	 *
	 * If there's more criteria, push a score (0)
	 *
	 * If there's less criteria, pop a score
	 *
	 * @param criteria - list of criteria
	 * @param alternatives - list of alternatives
	 */
	const syncScores = (criteria: Criteria[], alternatives: Alternative[]) => {
		const needed = criteria.length - alternatives[0].scores.length;
		if (needed > -1) {
			alternatives.forEach((alt) => {
				for (let i = 0; i < needed; i++) {
					alt.scores.push(0);
					console.log(alt.scores);
				}
			});
		} else {
			alternatives.forEach((alt) => {
				for (let i = 0; i < Math.abs(needed); i++) {
					alt.scores.pop();
				}
			});
		}
		$alternatives = $alternatives;
	};

	// called any time $criteria or $alternatives change
	$: syncScores($criteria, $alternatives);
</script>

<section>
	<div class="not-prose mt-8 text-2xl font-bold text-stone-800">
		<h2>Alternatives</h2>
	</div>
	<div class="overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th />
					{#each $criteria as { name }}
						<th>{name}</th>
					{/each}
				</tr>
				<tr>
					<th>Name</th>
					{#each $criteria as { weight }}
						<th>{(weight * 100).toFixed(0)}%</th>
					{/each}
					<th />
				</tr>
			</thead>
			<tbody>
				{#each $alternatives as alt, i}
					<tr>
						<td>
							<input
								type="text"
								name="{alt.name}{i}"
								id="{alt.name}{i}"
								bind:value={alt.name} />
						</td>
						{#each alt.scores as score, j}
							<td>
								<input
									type="number"
									name="{alt.name}{i}score{j}"
									id="{alt.name}{i}score{j}"
									bind:value={alt.scores[j]}
									min="0"
									max="10"
									class="w-20" />
							</td>
						{/each}
						<td>
							<button class="btn-s" on:click={() => removeAlternative(i)}>
								<XMark />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<button class="w-full" on:click={addAlternative}>Add</button>
</section>

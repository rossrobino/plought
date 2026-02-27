<script lang="ts">
	import { alternatives } from "$lib/state";

	const updateInverse = (i: number, j: number) => {
		const newScore = alternatives.current[i].pairwise[j];
		alternatives.current[j].pairwise[i] =
			newScore > 0.5 ? 0 : newScore === 0.5 ? 0.5 : 1;
	};
</script>

<section>
	<h2>Comparisons</h2>
	<div class="mt-4 overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th></th>
					{#each alternatives.current as { name }}
						<th>{name}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each alternatives.current as alt, i}
					<tr>
						<th>{alt.name}</th>
						{#each alt.pairwise as _, j}
							<td>
								{#if alternatives.current[i] !== alternatives.current[j]}
									{#if i < j}
										<select
											bind:value={alternatives.current[i].pairwise[j]}
											onchange={() => updateInverse(i, j)}
										>
											<option value={1}>
												{alternatives.current[i].name}
											</option>
											<option value={0.5}>Tie</option>
											<option value={0}>{alternatives.current[j].name}</option>
										</select>
									{:else if alternatives.current[i].pairwise[j] === 1}
										{alternatives.current[i].name}
									{:else if alternatives.current[i].pairwise[j] === 0}
										{alternatives.current[j].name}
									{:else}
										Tie
									{/if}
								{:else}
									<span class="text-stone-400">-</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

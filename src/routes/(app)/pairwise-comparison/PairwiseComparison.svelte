<script lang="ts">
	import { alternatives } from "$lib/stores";
	import { Icon } from "@liquidiqq/iconkit";

	const updateInverse = (i: number, j: number) => {
		const newScore = $alternatives[i].pairwise[j];
		$alternatives[j].pairwise[i] =
			newScore > 0.5 ? 0 : newScore === 0.5 ? 0.5 : 1;
		$alternatives = $alternatives;
	};
</script>

<section>
	<h2>
		<span class="icon"><Icon name="adjustments-horizontal" /></span>
		Comparisons
	</h2>
	<div class="mt-4 overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th />
					{#each $alternatives as { name }}
						<th>{name}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each $alternatives as alt, i}
					<tr>
						<th>{alt.name}</th>
						{#each alt.pairwise as score, j}
							<td>
								{#if $alternatives[i] !== $alternatives[j]}
									{#if i < j}
										<select
											bind:value={$alternatives[i].pairwise[j]}
											on:change={() => updateInverse(i, j)}
										>
											<option value={1}>
												{$alternatives[i].name}
											</option>
											<option value={0.5}>Tie</option>
											<option value={0}>{$alternatives[j].name}</option>
										</select>
									{:else if $alternatives[i].pairwise[j] === 1}
										{$alternatives[i].name}
									{:else if $alternatives[i].pairwise[j] === 0}
										{$alternatives[j].name}
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

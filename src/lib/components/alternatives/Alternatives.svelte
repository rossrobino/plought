<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";
	import { Icon } from "@liquidiqq/iconkit";
	import AddAlternativeButton from "$lib/components/alternatives/AddAlternativeButton.svelte";
	import RemoveAlternativeButton from "$lib/components/alternatives/RemoveAlternativeButton.svelte";

	/** controls if criteria are displayed */
	export let showCriteria = false;
</script>

<section>
	<h2>
		<span class="icon"><Icon name="square-3-stack-3d" /></span>
		Alternatives
	</h2>
	<div class="mt-4 overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th />
					<th>Name</th>
					{#if showCriteria}
						{#each $criteria as { name }}
							<th>{name}</th>
						{/each}
					{/if}
					<th />
				</tr>
			</thead>
			<tbody>
				{#each $alternatives as alt, i}
					<tr>
						<td>
							<label for="{alt.name}{i}">#{i + 1}</label>
						</td>
						<td>
							<input
								type="text"
								name="{alt.name}{i}"
								id="{alt.name}{i}"
								bind:value={alt.name}
								required
								placeholder="Alternative"
							/>
						</td>
						{#if showCriteria}
							{#each alt.scores as score, j}
								<td>
									<input
										type="number"
										name="{alt.name}{i}score{j}"
										id="{alt.name}{i}score{j}"
										bind:value={alt.scores[j]}
										min="0"
										max="10"
										required
										inputmode="decimal"
										placeholder="0"
									/>
								</td>
							{/each}
						{/if}
						<td>
							<RemoveAlternativeButton index={i} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<AddAlternativeButton />
</section>

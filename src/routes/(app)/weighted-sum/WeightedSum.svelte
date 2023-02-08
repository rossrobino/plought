<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";
	import { addAlternative, removeAlternative } from "$lib/util/alternative";
	import XMark from "$lib/svg/XMark.svelte";
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
								bind:value={alt.name}
								required
							/>
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
									class="w-20"
									required
									inputmode="decimal"
								/>
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

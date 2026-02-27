<script lang="ts">
	import { alternatives, criteria } from "$lib/state";
	import XMark from "$lib/svg/XMark.svelte";
	import type { Criteria } from "$lib/types";

	interface Props {
		weights?: boolean;
	}

	/** controls if weights column is displayed*/
	let { weights = true }: Props = $props();

	const addCriteria = () => {
		criteria.current.push({
			name: `Criteria #${criteria.current.length + 1}`,
			weight: 0,
		});
		alternatives.current.forEach((alt) => {
			alt.scores.push(0);
		});
	};

	const removeCriteria = (index: number) => {
		criteria.current.splice(index, 1);
		alternatives.current.forEach((alt) => {
			alt.scores.splice(index, 1);
		});
	};

	const getWeights = (criteria: Criteria[]) => {
		return criteria.map(({ weight }) => {
			return weight;
		});
	};

	const sumArray = (a: number[]) => {
		return a.reduce((a, b) => a + b, 0);
	};
</script>

<section>
	<h2>Criteria</h2>
	<div class="mt-4 overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th></th>
					<th>Name</th>
					{#if weights}
						<th>Weight</th>
					{/if}
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each criteria.current as item, i (i)}
					<tr>
						<td><label for="name{i}">#{i + 1}</label></td>
						<td>
							<input
								type="text"
								name="name"
								id="name{i}"
								class="w-full"
								bind:value={item.name}
								required
								placeholder="Criteria"
							/>
						</td>
						{#if weights}
							<td>
								<input
									type="number"
									name="weight"
									id="weight{i}"
									bind:value={item.weight}
									step="0.01"
									min="0"
									max="1"
									class="w-full"
									required
									inputmode="decimal"
									placeholder="0"
								/>
							</td>
						{/if}
						<td>
							<button
								class="btn-s"
								onclick={() => removeCriteria(i)}
								disabled={criteria.current.length < 2}
							>
								<XMark />
							</button>
						</td>
					</tr>
				{/each}
				{#if weights}
					<tr>
						<th>Total</th>
						<td></td>

						<td>
							<span
								class={{
									"text-rose-800":
										Math.round(sumArray(getWeights(criteria.current)) * 100) !==
										100,
								}}
							>
								{(sumArray(getWeights(criteria.current)) * 100).toFixed()}
							</span>
							/ 100
						</td>

						<td></td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
	<button onclick={addCriteria} class="mt-4 w-full">Add</button>
</section>

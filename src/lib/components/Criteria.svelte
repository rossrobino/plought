<script lang="ts">
	import { criteria } from "$lib/stores";
	import XMark from "$lib/svg/XMark.svelte";

	const addCriteria = () => {
		$criteria.push({ name: "Criteria", weight: 0 });
		$criteria = $criteria;
	};

	const removeCriteria = (index: number) => {
		$criteria.splice(index, 1);
		$criteria = $criteria;
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
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Weight</th>
			</tr>
		</thead>
		<tbody>
			{#each $criteria as { name, weight }, i}
				<tr>
					<td>
						<input
							type="text"
							name="name"
							id="name{i}"
							class="w-full"
							bind:value={name} />
					</td>
					<td>
						<input
							type="number"
							name="weight"
							id="weight{i}"
							bind:value={weight}
							step="0.01"
							min="0"
							max="1"
							class="w-full" />
					</td>
					<td>
						<button class="btn-s" on:click={() => removeCriteria(i)}>
							<XMark />
						</button>
					</td>
				</tr>
			{/each}
			<tr>
				<th>Total</th>
				<th>{(sumArray(getWeights($criteria)) * 100).toFixed()}%</th>
			</tr>
		</tbody>
	</table>
	<button on:click={addCriteria} class="w-full">Add</button>
</section>

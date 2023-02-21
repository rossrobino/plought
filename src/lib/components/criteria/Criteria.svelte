<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";
	import { Icon } from "@liquidiqq/iconkit";
	import XMark from "$lib/svg/XMark.svelte";

	/** controls if weights column is displayed*/
	export let weights = true;

	const addCriteria = () => {
		$criteria.push({ name: `Criteria #${$criteria.length + 1}`, weight: 0 });
		$alternatives.forEach((alt) => {
			alt.scores.push(0);
		});
		$criteria = $criteria;
		$alternatives = $alternatives;
	};

	const removeCriteria = (index: number) => {
		$criteria.splice(index, 1);
		$alternatives.forEach((alt) => {
			alt.scores.splice(index, 1);
		});
		$criteria = $criteria;
		$alternatives = $alternatives;
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
	<h2>
		<span class="icon"><Icon name="scale" /></span>
		Criteria
	</h2>
	<div class="mt-4 overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th />
					<th>Name</th>
					{#if weights}
						<th>Weight</th>
					{/if}
					<th />
				</tr>
			</thead>
			<tbody>
				{#each $criteria as { name, weight }, i}
					<tr>
						<td><label for="name{i}">#{i + 1}</label></td>
						<td>
							<input
								type="text"
								name="name"
								id="name{i}"
								class="w-full"
								bind:value={name}
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
									bind:value={weight}
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
								on:click={() => removeCriteria(i)}
								disabled={$criteria.length < 2}
							>
								<XMark />
							</button>
						</td>
					</tr>
				{/each}
				{#if weights}
					<tr>
						<th>Total</th>
						<td />

						<td>
							<span
								class:text-rose-800={Math.round(
									sumArray(getWeights($criteria)) * 100,
								) !== 100}
							>
								{(sumArray(getWeights($criteria)) * 100).toFixed()}
							</span>
							/ 100
						</td>

						<td />
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
	<button on:click={addCriteria} class="mt-4 w-full">Add</button>
</section>

<script lang="ts">
	import { categories, items } from "$lib/stores";

	interface Item {
		name: string;
		scores: number[];
	}

	interface Category {
		name: string;
		weight: number;
	}
	const addCategory = () => {
		$categories.push({ name: "category", weight: 0 });
		$categories = $categories;
	};

	const addItem = () => {
		const scores: number[] = new Array($categories.length).fill(0);
		$items.push({ name: "item", scores });
		$items = $items;
	};

	const getWeights = (categories: Category[]) => {
		return categories.map(({ weight }) => {
			return weight;
		});
	};

	const sumArray = (a: number[]) => {
		return a.reduce((a, b) => a + b, 0);
	};

	/**
	 * Takes the weights of each category and the scores of an item,
	 * multiplies them together, and sums the list, returns total score
	 *
	 * @param weights - list of weights for each category
	 * @param scores - list of scores for a particular item
	 */
	const calcTotal = (weights: number[], scores: number[]): number => {
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

	/**
	 * Checks if the number of scores for each item match
	 * the number of categories.
	 *
	 * If there's more categories, push a score (0)
	 *
	 * If there's less categories, pop a score
	 *
	 * @param categories - list of categories
	 * @param items - list of items
	 */
	const syncScores = (categories: Category[], items: Item[]) => {
		const needed = categories.length - items[0].scores.length;
		if (needed > -1) {
			items.forEach((item) => {
				for (let i = 0; i < needed; i++) {
					item.scores.push(0);
					console.log(item.scores);
				}
			});
		} else {
			items.forEach((item) => {
				for (let i = 0; i < Math.abs(needed); i++) {
					item.scores.pop();
				}
			});
		}
		$items = $items;
	};

	const sortItems = () => {
		$items.sort((a, b) => {
			return (
				calcTotal(getWeights($categories), b.scores) -
				calcTotal(getWeights($categories), a.scores)
			);
		});
		$items = $items;
	};

	const removeItem = (index: number) => {
		$items.splice(index, 1);
		$items = $items;
	};

	const removeCategory = (index: number) => {
		$categories.splice(index, 1);
		$categories = $categories;
	};

	const reset = () => {
		$categories = [
			{
				name: "Category #1",
				weight: 0.5,
			},
			{
				name: "Category #2",
				weight: 0.5,
			},
		];
		$items = [
			{
				name: "Item #1",
				scores: [5, 5],
			},
			{
				name: "Item #2",
				scores: [5, 5],
			},
		];
	};

	// called any time $categories or $items change
	$: syncScores($categories, $items);
</script>

<section>
	<p>
		Create a category for each factor impacting a decision. Give each category a
		weight based on how much it impacts the decision.
	</p>
	<table>
		<thead>
			<tr>
				<th>Category</th>
				<th>Weight</th>
			</tr>
		</thead>
		<tbody>
			{#each $categories as { name, weight }, i}
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
						<button class="btn-s w-12" on:click={() => removeCategory(i)}>
							x
						</button>
					</td>
				</tr>
			{/each}
			<tr>
				<th>Total</th>
				<th>{(sumArray(getWeights($categories)) * 100).toFixed()}%</th>
			</tr>
		</tbody>
	</table>
	<button on:click={addCategory} class="w-full">Add</button>
</section>
<section>
	<p>
		Give each option a score for each category being considered, score each
		category independently of the others. A higher score indicates a more
		preferable choice.
	</p>
	<div class="overflow-x-auto">
		<table>
			<thead>
				<tr>
					<th />
					<th />
					{#each $categories as { name }}
						<th>{name}</th>
					{/each}
				</tr>
				<tr>
					<th>Name</th>
					<th>Score</th>
					{#each $categories as { weight }}
						<th>{(weight * 100).toFixed(0)}%</th>
					{/each}
					<th />
				</tr>
			</thead>
			<tbody>
				{#each $items as item, i}
					<tr>
						<td>
							<input
								type="text"
								name="{item.name}{i}"
								id="{item.name}{i}"
								bind:value={item.name} />
						</td>
						<td class="font-bold">
							{calcTotal(getWeights($categories), item.scores)}
						</td>
						{#each item.scores as score, j}
							<td>
								<input
									type="number"
									name="{item.name}{i}score{j}"
									id="{item.name}{i}score{j}"
									bind:value={item.scores[j]}
									min="0"
									max="10"
									class="w-20" />
							</td>
						{/each}
						<td>
							<button class="btn-s w-12" on:click={() => removeItem(i)}>
								x
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="my-4 grid grid-cols-2 gap-2">
		<button on:click={addItem}>Add</button>
		<button class="btn-s w-full" on:click={sortItems}>Sort</button>
	</div>
	<button class="btn-s w-full" on:click={reset}>Reset All</button>
</section>

<script lang="ts">
	import { criteria, alternatives } from "$lib/stores";
	import { get } from "svelte/store";

	export const addAlternative = () => {
		const scores: number[] = new Array($criteria.length).fill(0);
		const pairwise: number[] = new Array($alternatives.length + 1).fill(
			0.5,
		);
		const copy = [...get(alternatives)];
		copy.forEach((alt) => {
			alt.pairwise.push(0.5);
		});
		alternatives.update(() =>
			copy.concat({
				name: `Alternative #${get(alternatives).length + 1}`,
				scores,
				pairwise,
			}),
		);
	};
</script>

<button class="w-full" on:click={addAlternative}>Add</button>

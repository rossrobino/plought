<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { alternatives, criteria, syncRankOrder } from "$lib/state";
	import PlusIcon from "@lucide/svelte/icons/plus";

	interface Props {
		onChange?: () => void;
	}

	let { onChange }: Props = $props();

	export const addAlternative = () => {
		// create an array of zeros based on the number of criteria
		const scores: number[] = new Array(criteria.current.length).fill(0);

		// create an array of pairwise scores based on the number of alternatives
		const pairwise: number[] = new Array(alternatives.current.length + 1).fill(
			0.5,
		);

		// add an extra pairwise score for each alternative
		// corresponding with the new alternative
		alternatives.current.forEach((alt) => {
			alt.pairwise.push(0.5);
		});

		// push the new alternative to the list
		alternatives.current.push({
			name: `Alternative #${alternatives.current.length + 1}`,
			scores,
			pairwise,
		});

		syncRankOrder();
	};
</script>

<div class="mt-3 flex justify-end">
	<Button
		size="sm"
		onclick={() => {
			addAlternative();
			onChange?.();
		}}
	>
		<PlusIcon />
		Add
	</Button>
</div>

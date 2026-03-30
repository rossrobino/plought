<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { alternatives, criteria, syncAllocation } from "$lib/state";
	import PlusIcon from "@lucide/svelte/icons/plus";

	interface Props {
		onChange?: () => void;
	}

	let { onChange }: Props = $props();

	export const addAlternative = () => {
		alternatives.current.forEach((item) => {
			item.pairwise.push(0.5);
		});
		alternatives.current.push({
			name: "",
			scores: Array.from({ length: criteria.current.length }, () => 0),
			pairwise: Array.from(
				{ length: alternatives.current.length + 1 },
				() => 0.5,
			),
		});
		syncAllocation();
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

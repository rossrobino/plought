<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { alternatives, appendAlternatives } from "$lib/state";
	import PlusIcon from "@lucide/svelte/icons/plus";

	interface Props {
		onChange?: () => void;
	}

	let { onChange }: Props = $props();

	export const addAlternative = () => {
		appendAlternatives([`Alternative #${alternatives.current.length + 1}`]);
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

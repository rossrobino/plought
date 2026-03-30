<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { alternatives, syncAllocation } from "$lib/state";
	import XIcon from "@lucide/svelte/icons/x";

	interface Props {
		index: number;
		onChange?: () => void;
	}

	let { index, onChange }: Props = $props();

	const removeAlternative = (index: number) => {
		alternatives.current.splice(index, 1);
		alternatives.current.forEach((alt) => {
			alt.pairwise.splice(index, 1);
		});
		syncAllocation();
	};
</script>

<Button
	variant="secondary"
	size="icon-sm"
	onclick={() => {
		removeAlternative(index);
		onChange?.();
	}}
	aria-label={`Remove alternative ${index + 1}`}
>
	<XIcon class="size-4" />
</Button>

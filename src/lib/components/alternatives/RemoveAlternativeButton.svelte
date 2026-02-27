<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { alternatives } from "$lib/state";
	import XMark from "$lib/svg/XMark.svelte";

	interface Props {
		index: number;
	}

	let { index }: Props = $props();
	const disabled = $derived(alternatives.current.length < 2);

	const removeAlternative = (index: number) => {
		alternatives.current.splice(index, 1);
		alternatives.current.forEach((alt) => {
			alt.pairwise.splice(index, 1);
		});
	};
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="secondary"
					size="icon-sm"
					aria-disabled={disabled}
					class={disabled ? "aria-disabled:pointer-events-auto" : undefined}
					onclick={() => {
						if (!disabled) {
							removeAlternative(index);
						}
					}}
					aria-label={`Remove alternative ${index + 1}`}
				>
					<XMark class="size-4" />
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		{#if disabled}
			<Tooltip.Content sideOffset={8}>
				At least two alternatives are required.
			</Tooltip.Content>
		{/if}
	</Tooltip.Root>
</Tooltip.Provider>

<script lang="ts">
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	type Props = {
		as?: string;
		children?: Snippet;
		class?: string;
		desc?: string;
		descClass?: string;
		eyebrow?: string;
		eyebrowClass?: string;
		title: string;
		titleClass?: string;
	};

	let {
		as = "h2",
		children,
		class: className = "",
		desc = "",
		descClass = "",
		eyebrow,
		eyebrowClass = "",
		title,
		titleClass = "",
	}: Props = $props();

	const hasEyebrow = $derived((eyebrow?.trim() ?? "").length > 0);
	const hasDesc = $derived(desc.trim().length > 0);
</script>

<div class={className}>
	{#if hasEyebrow}
		<Eyebrow class={cn("mb-2", eyebrowClass)}>{eyebrow}</Eyebrow>
	{/if}
	<svelte:element this={as} class={cn("mb-0", titleClass)}>
		{title}
	</svelte:element>
	{#if hasDesc}
		<p
			class={cn(
				hasEyebrow ? "mt-2" : "mt-1",
				"text-muted-foreground",
				descClass,
			)}
		>
			{desc}
		</p>
	{/if}
	{@render children?.()}
</div>

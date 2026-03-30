<script lang="ts">
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import type { Snippet } from "svelte";
	import type { ClassValue } from "svelte/elements";

	type Props = {
		as?: string;
		children?: Snippet;
		class?: ClassValue;
		desc?: string;
		descClass?: ClassValue;
		eyebrow?: string;
		eyebrowClass?: ClassValue;
		title: string;
		titleClass?: ClassValue;
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
		<Eyebrow class={["mb-2", eyebrowClass]}>{eyebrow}</Eyebrow>
	{/if}
	<svelte:element this={as} class={["mb-0", titleClass]}>
		{title}
	</svelte:element>
	{#if hasDesc}
		<p
			class={[hasEyebrow ? "mt-2" : "mt-1", "text-muted-foreground", descClass]}
		>
			{desc}
		</p>
	{/if}
	{@render children?.()}
</div>

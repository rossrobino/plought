<script lang="ts">
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import type { Snippet } from "svelte";
	import type { ClassValue } from "svelte/elements";

	type EyebrowVariant = "default" | "compact" | "subtle";
	type Props = {
		children?: Snippet;
		class?: ClassValue;
		eyebrowVariant?: EyebrowVariant;
		label: string;
		labelClass?: ClassValue;
	};

	let {
		children,
		class: className = "",
		eyebrowVariant = "subtle",
		label,
		labelClass = "",
	}: Props = $props();
</script>

<div class={["rounded-lg border p-3 shadow-xs", className]}>
	<Eyebrow variant={eyebrowVariant} class={["mb-0", labelClass]}>
		{label}
	</Eyebrow>
	{@render children?.()}
</div>

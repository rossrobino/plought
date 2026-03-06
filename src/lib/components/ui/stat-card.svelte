<script lang="ts">
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	type EyebrowVariant = "default" | "compact" | "subtle";
	type Props = {
		children?: Snippet;
		class?: string;
		eyebrowVariant?: EyebrowVariant;
		label: string;
		labelClass?: string;
	};

	let {
		children,
		class: className = "",
		eyebrowVariant = "subtle",
		label,
		labelClass = "",
	}: Props = $props();
</script>

<div class={cn("rounded-lg border p-3 shadow-xs", className)}>
	<Eyebrow variant={eyebrowVariant} class={cn("mb-0", labelClass)}>
		{label}
	</Eyebrow>
	{@render children?.()}
</div>

<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	type Variant = "default" | "compact" | "subtle";
	type Props = {
		as?: string;
		children?: Snippet;
		class?: string;
		variant?: Variant;
	};

	let {
		as = "p",
		class: className = "",
		variant = "default",
		children,
	}: Props = $props();

	const variantClass: Record<Variant, string> = {
		default: "text-xs font-semibold tracking-[0.24em]",
		compact: "text-[11px] tracking-[0.16em]",
		subtle: "text-xs tracking-wide",
	};
	const classes = $derived(variantClass[variant]);
</script>

<svelte:element
	this={as}
	class={cn("truncate text-muted-foreground uppercase", classes, className)}
>
	{@render children?.()}
</svelte:element>

<script lang="ts">
	import type { Snippet } from "svelte";
	import type { ClassValue } from "svelte/elements";

	type Variant = "default" | "compact" | "subtle";
	type Props = {
		as?: string;
		children?: Snippet;
		class?: ClassValue;
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
	class={["truncate text-muted-foreground uppercase", classes, className]}
>
	{@render children?.()}
</svelte:element>

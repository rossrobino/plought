<script lang="ts">
	import { type WithoutChildrenOrChild, cn } from "$lib/utils.js";
	import { Progress as ProgressPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> = $props();

	const percent = $derived.by(() => {
		if (max == null || max <= 0) {
			return 0;
		}
		return Math.max(0, Math.min(100, (100 * (value ?? 0)) / max));
	});
	const complete = $derived(percent >= 100);
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="progress"
	class={cn(
		complete
			? "relative h-2 w-full overflow-hidden rounded-full bg-primary/20"
			: "relative h-2 w-full overflow-hidden rounded-full bg-amber-400/25 dark:bg-amber-300/20",
		className,
	)}
	{value}
	{max}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class={complete
			? "h-full w-full flex-1 bg-primary transition-all"
			: "h-full w-full flex-1 bg-amber-400 transition-all dark:bg-amber-300"}
		style="transform: translateX(-{100 - percent}%)"
	></div>
</ProgressPrimitive.Root>

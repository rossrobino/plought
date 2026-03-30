<script lang="ts">
	import { Separator } from "$lib/components/ui/separator";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	bind:ref
	data-slot="sidebar-separator"
	data-sidebar="separator"
	class={["bg-sidebar-border", className]}
	{...restProps}
/>

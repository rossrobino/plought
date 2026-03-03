<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Switch as SwitchPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		"data-slot": dataSlot = "switch",
		...restProps
	}: SwitchPrimitive.RootProps = $props();
</script>

<SwitchPrimitive.Root
	bind:ref
	{checked}
	data-slot={dataSlot}
	class={cn(
		"peer inline-flex h-5 w-9 shrink-0 items-center rounded-[4px] border border-border/70 bg-muted/40 p-0.5 shadow-xs transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary/55",
		className,
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		data-slot="switch-thumb"
		class="pointer-events-none block size-4 rounded-[2px] border border-border/70 bg-background shadow-sm ring-0 transition-transform duration-200 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
	/>
</SwitchPrimitive.Root>

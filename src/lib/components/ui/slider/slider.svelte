<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Slider as SliderPrimitive } from "bits-ui";

	type Props = Omit<
		SliderPrimitive.RootProps,
		"type" | "value" | "onValueChange"
	> & { onValueChange?: (value: number) => void; value?: number };

	let {
		ref = $bindable(null),
		class: className,
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		value = $bindable(0),
		onValueChange,
	}: Props = $props();

	const handleValueChange = (next: number) => {
		value = next;
		onValueChange?.(next);
	};
</script>

<SliderPrimitive.Root
	bind:ref
	type="single"
	{value}
	{min}
	{max}
	{step}
	{disabled}
	onValueChange={handleValueChange}
	data-slot="slider"
	class={cn(
		"relative flex w-full touch-none items-center select-none",
		"data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2 data-[orientation=vertical]:flex-col",
		className,
	)}
>
	<span
		data-slot="slider-track"
		class="relative h-1.5 w-full grow overflow-hidden rounded-[2px] bg-muted"
	>
		<SliderPrimitive.Range
			data-slot="slider-range"
			class="absolute h-full bg-primary"
		/>
	</span>
	<SliderPrimitive.Thumb
		data-slot="slider-thumb"
		index={0}
		class={cn(
			"block size-4 rounded-[2px] border border-primary/50 bg-background shadow-sm transition-[color,box-shadow] outline-none",
			"focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
			"disabled:pointer-events-none disabled:opacity-50",
		)}
	/>
</SliderPrimitive.Root>

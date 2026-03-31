<script lang="ts">
	import { type WithElementRef, type WithoutChildren } from "$lib/utils.js";
	import { useChart } from "./chart-utils.js";
	import {
		type ChartState,
		Tooltip as TooltipPrimitive,
		getChartContext,
	} from "layerchart";
	import type { Snippet } from "svelte";
	import type { ClassValue, HTMLAttributes } from "svelte/elements";

	type TooltipData = Record<string, unknown>;
	type TooltipSeries = ChartState<TooltipData>["tooltip"]["series"][number];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function defaultFormatter(value: any, _payload: TooltipSeries[]) {
		return `${value}`;
	}

	let {
		ref = $bindable(null),
		class: className,
		hideLabel = false,
		indicator = "dot",
		hideIndicator = false,
		labelKey,
		label,
		labelFormatter = defaultFormatter,
		labelClassName,
		formatter,
		nameKey,
		color,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		hideLabel?: boolean;
		label?: string;
		indicator?: "line" | "dot" | "dashed";
		nameKey?: string;
		labelKey?: string;
		hideIndicator?: boolean;
		labelClassName?: ClassValue;
		labelFormatter?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
			| ((value: any, payload: TooltipSeries[]) => string | number | Snippet)
			| null;
		formatter?: Snippet<
			[
				{
					value: unknown;
					name: string;
					item: TooltipSeries;
					index: number;
					payload: TooltipSeries[];
					data: TooltipData | null;
				},
			]
		>;
	} = $props();

	const chart = useChart();
	const context = getChartContext<TooltipData>();
	const tooltipSeries = $derived(
		context.tooltip.series.filter((item) => item.visible),
	);

	const formattedLabel = $derived.by(() => {
		if (hideLabel || context.tooltip.data == null) return null;

		const data = context.tooltip.data;
		const value =
			labelKey != null && labelKey in data
				? data[labelKey]
				: label != null
					? label
					: context.valueAxis === "y"
						? context.x(data)
						: context.y(data);

		if (value === undefined) return null;
		if (!labelFormatter) return value;
		return labelFormatter(value, tooltipSeries);
	});

	const nestLabel = $derived(tooltipSeries.length === 1 && indicator !== "dot");
</script>

{#snippet TooltipLabel()}
	{#if formattedLabel}
		<div class={["font-medium", labelClassName]}>
			{#if typeof formattedLabel === "function"}
				{@render formattedLabel()}
			{:else}
				{formattedLabel}
			{/if}
		</div>
	{/if}
{/snippet}

<TooltipPrimitive.Root {context} variant="none">
	{#snippet children()}
		<div
			class={[
				"grid min-w-36 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
				className,
			]}
			{...restProps}
		>
			{#if !nestLabel}
				{@render TooltipLabel()}
			{/if}
			<div class="grid gap-1.5">
				{#each tooltipSeries as item, i (item.key + i)}
					{@const key = `${nameKey || item.key || item.label || "value"}`}
					{@const itemConfig = chart.config[key] ?? chart.config[item.key]}
					{@const indicatorColor = color || item.color}
					<div
						class={[
							"flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground",
							indicator === "dot" && "items-center",
						]}
					>
						{#if formatter && item.value !== undefined}
							{@render formatter({
								value: item.value,
								name: item.label,
								item,
								index: i,
								payload: tooltipSeries,
								data: context.tooltip.data,
							})}
						{:else}
							{#if itemConfig?.icon}
								<itemConfig.icon />
							{:else if !hideIndicator}
								<div
									style="--color-bg: {indicatorColor}; --color-border: {indicatorColor};"
									class={[
										"shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
										{
											"size-2.5": indicator === "dot",
											"h-full w-1": indicator === "line",
											"w-0 border-[1.5px] border-dashed bg-transparent":
												indicator === "dashed",
											"my-0.5": nestLabel && indicator === "dashed",
										},
									]}
								></div>
							{/if}
							<div
								class={[
									"flex flex-1 shrink-0 justify-between leading-none",
									nestLabel ? "items-end" : "items-center",
								]}
							>
								<div class="grid gap-1.5">
									{#if nestLabel}
										{@render TooltipLabel()}
									{/if}
									<span class="text-muted-foreground">
										{itemConfig?.label || item.label}
									</span>
								</div>
								{#if item.value !== undefined}
									<span
										class="font-mono font-medium text-foreground tabular-nums"
									>
										{item.value.toLocaleString()}
									</span>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</TooltipPrimitive.Root>

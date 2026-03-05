<script lang="ts">
	import { type ChartConfig, ChartContainer } from "$lib/components/ui/chart";
	import { chartColors } from "$lib/util/chart-colors";
	import { Circle, LineChart, Tooltip } from "layerchart";

	interface Row {
		best: number;
		closeness: number;
		color: string;
		key: string;
		label: string;
		worst: number;
	}

	interface Props {
		best: number[];
		rows: string[];
		worst: number[];
	}

	let { best, rows, worst }: Props = $props();

	const config = $derived<ChartConfig>({
		trend: { color: chartColors[1], label: "Trend" },
	});

	const data = $derived.by(() => {
		const values = rows.map((label, i) => {
			const distBest = best[i] ?? 0;
			const distWorst = worst[i] ?? 0;
			const sum = distBest + distWorst;
			const closeness = sum <= 0 ? 0 : (distWorst / sum) * 10;
			return {
				best: distBest,
				closeness: Number(closeness.toFixed(2)),
				color: chartColors[i % chartColors.length],
				key: `alt-${i}`,
				label,
				worst: distWorst,
			};
		});

		values.sort((a, b) => a.closeness - b.closeness);
		return values;
	});

	const height = 92;
	const chartPadding = { bottom: 44, left: 24, right: 24, top: 16 };
	const yDomain: [number, number] = [0, 1];

	const formatValue = (value: unknown) => {
		return (typeof value === "number" ? value : Number(value ?? 0)).toFixed(2);
	};
</script>

<ChartContainer
	{config}
	class="aspect-auto flex-col items-stretch justify-start gap-2 rounded-lg border bg-muted/20 p-2 shadow-xs"
>
	<div class="w-full" style={`height:${height}px;`}>
		<LineChart
			{data}
			x={(d: Row) => d.closeness}
			y={() => 0.5}
			xDomain={[0, 10]}
			{yDomain}
			padding={chartPadding}
			axis="x"
			grid={false}
			rule={false}
			labels={false}
			legend={false}
			points={false}
			highlight={false}
			props={{
				xAxis: {
					format: (tick: number | string) => {
						const value = Number(tick);
						if (value === 0) {
							return "Worst";
						}
						if (value === 10) {
							return "Best";
						}
						return `${value}`;
					},
					ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
					tickMarks: false,
					tickSpacing: 52,
				},
			}}
		>
			{#snippet marks({ context })}
				{@const axisY = Number(context.yScale(0.5))}
				{@const axisStart = Math.min(
					Number(context.xRange[0] ?? 0),
					Number(context.xRange[1] ?? 0),
				)}
				{@const axisEnd = Math.max(
					Number(context.xRange[0] ?? 0),
					Number(context.xRange[1] ?? 0),
				)}
				{@const capHeight = 18}
				<line
					x1={axisStart}
					y1={axisY}
					x2={axisEnd}
					y2={axisY}
					stroke={chartColors[1]}
					stroke-linecap="round"
					stroke-opacity="0.45"
					stroke-width="4"
				/>
				<rect
					x={axisStart - 1.5}
					y={axisY - capHeight / 2}
					width={3}
					height={capHeight}
					rx={1.5}
					fill={chartColors[1]}
					fill-opacity="0.38"
				/>
				<rect
					x={axisEnd - 1.5}
					y={axisY - capHeight / 2}
					width={3}
					height={capHeight}
					rx={1.5}
					fill={chartColors[1]}
					fill-opacity="0.38"
				/>
				{#each data as item (item.key)}
					<Circle
						cx={Number(context.xScale(item.closeness))}
						cy={axisY}
						r={8}
						fill={item.color}
						stroke="var(--background)"
						strokeWidth={2}
					/>
				{/each}
			{/snippet}
			{#snippet tooltip({ context })}
				<Tooltip.Root {context} variant="none">
					{#snippet children({ data: item })}
						<div
							class="grid min-w-[12rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl"
						>
							<div class="font-medium text-foreground">{item.label}</div>
							<div class="flex items-center justify-between gap-4">
								<span class="text-muted-foreground">Closeness</span>
								<span class="font-mono font-medium tabular-nums">
									{formatValue(item.closeness)}
								</span>
							</div>
							<div class="flex items-center justify-between gap-4">
								<span class="text-muted-foreground">Distance to best</span>
								<span class="font-mono tabular-nums">
									{formatValue(item.best)}
								</span>
							</div>
							<div class="flex items-center justify-between gap-4">
								<span class="text-muted-foreground">Distance to worst</span>
								<span class="font-mono tabular-nums">
									{formatValue(item.worst)}
								</span>
							</div>
						</div>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</LineChart>
	</div>

	<div
		class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-2 pt-1 pb-0 text-xs"
	>
		{#each data as item (item.key)}
			<div class="flex items-center gap-1.5 text-muted-foreground">
				<span
					class="inline-block size-2.5 rounded-none"
					style={`background-color:${item.color};`}
				></span>
				<span>{item.label}</span>
			</div>
		{/each}
	</div>
</ChartContainer>

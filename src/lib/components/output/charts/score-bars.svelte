<script lang="ts">
	import {
		type ChartConfig,
		ChartContainer,
		ChartTooltip,
	} from "$lib/components/ui/chart/index.js";
	import { BarChart } from "layerchart";

	interface Series {
		color: string;
		key: string;
		label: string;
		values: number[];
	}

	type ChartRow = Record<string, number | string>;

	interface Props {
		max?: number;
		rows: string[];
		series: Series[];
		xLabel?: string;
		yLabel?: string;
	}

	let { max = 10, rows, series, xLabel, yLabel }: Props = $props();

	const config = $derived.by(() => {
		const next: ChartConfig = {};
		for (const item of series) {
			next[item.key] = { color: item.color, label: item.label };
		}
		return next;
	});

	const chartRows = $derived.by(() => {
		return rows.map((row, i) => {
			const next: ChartRow = { label: row };
			for (const item of series) {
				next[item.key] = item.values[i] ?? 0;
			}
			return next;
		});
	});

	const chartSeries = $derived.by(() => {
		return series.map((item) => {
			return {
				color: `var(--color-${item.key})`,
				key: item.key,
				label: item.label,
			};
		});
	});

	const maxValue = (row: ChartRow) => {
		let value = 0;
		for (const item of series) {
			const next = Number(row[item.key] ?? 0);
			if (next > value) {
				value = next;
			}
		}
		return value;
	};

	const height = $derived(
		Math.max(260, rows.length * (series.length > 1 ? 68 : 52)),
	);
	const chartPadding = $derived.by(() => {
		const left = Math.min(
			248,
			Math.max(
				104,
				rows.reduce((max, row) => Math.max(max, row.length), 0) * 7.2,
			),
		);
		return { bottom: 52, left, right: 20, top: 12 };
	});
	const resolvedXLabel = $derived(
		xLabel ?? (max === 10 ? "Score (0-10)" : "Value"),
	);
	const resolvedYLabel = $derived(yLabel ?? "Alternative");
</script>

<ChartContainer
	{config}
	class="aspect-auto flex-col items-stretch justify-start gap-2 rounded-lg border bg-muted/20 p-2 shadow-xs"
>
	<div class="w-full" style={`height:${height}px;`}>
		<BarChart
			orientation="horizontal"
			data={chartRows}
			x={maxValue}
			y={(d: ChartRow) => String(d.label ?? "")}
			xDomain={[0, max]}
			padding={chartPadding}
			series={chartSeries}
			seriesLayout={series.length > 1 ? "group" : "overlap"}
			axis={true}
			rule={false}
			grid={false}
			legend={false}
			props={{
				bars: { radius: 0, rounded: "none", strokeWidth: 0 },
				xAxis: {
					label: resolvedXLabel,
					labelProps: { dy: 12 },
					tickMarks: false,
					tickSpacing: 52,
				},
				yAxis: {
					label: resolvedYLabel,
					labelProps: { dx: 4 },
					tickMarks: false,
				},
			}}
		>
			{#snippet tooltip()}
				<ChartTooltip />
			{/snippet}
		</BarChart>
	</div>

	<div class="flex flex-wrap gap-x-3 gap-y-1 px-2 pt-1 pb-0 text-xs">
		{#each series as item (item.key)}
			<div class="flex items-center gap-1.5 text-muted-foreground">
				<span
					class="size-2.5 rounded-none"
					style={`background-color:${item.color};`}
				></span>
				<span>{item.label}</span>
			</div>
		{/each}
	</div>
</ChartContainer>

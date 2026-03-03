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
		rows: string[];
		series: Series[];
		xLabel?: string;
		yLabel?: string;
	}

	let { rows, series, xLabel, yLabel }: Props = $props();

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

	const totals = $derived.by(() => {
		return rows.map((_, i) => {
			return series.reduce((sum, item) => sum + (item.values[i] ?? 0), 0);
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

	const totalValue = (row: ChartRow) => {
		let total = 0;
		for (const item of series) {
			total += Number(row[item.key] ?? 0);
		}
		return total;
	};

	const maxTotal = $derived(Math.max(1, ...totals));
	const height = $derived(Math.max(288, rows.length * 56));
	const chartPadding = $derived.by(() => {
		const bottom = Math.min(
			68,
			Math.max(
				46,
				rows.reduce((max, row) => Math.max(max, row.length), 0) * 1.9 + 22,
			),
		);
		return { bottom, left: 94, right: 20, top: 12 };
	});
	const resolvedXLabel = $derived(xLabel ?? "Alternative");
	const resolvedYLabel = $derived(yLabel ?? "Value");
</script>

<ChartContainer
	{config}
	class="aspect-auto flex-col items-stretch justify-start gap-2 rounded-lg border bg-muted/20 p-2 shadow-xs"
>
	<div class="w-full" style={`height:${height}px;`}>
		<BarChart
			data={chartRows}
			x={(d: ChartRow) => String(d.label ?? "")}
			y={totalValue}
			yDomain={[0, maxTotal]}
			padding={chartPadding}
			series={chartSeries}
			seriesLayout="stack"
			axis={true}
			rule={false}
			grid={false}
			legend={false}
			props={{
				bars: { radius: 0, rounded: "none", strokeWidth: 0 },
				xAxis: {
					label: resolvedXLabel,
					labelProps: { dy: 10 },
					tickMarks: false,
				},
				yAxis: {
					label: resolvedYLabel,
					labelProps: { dx: 6 },
					tickMarks: false,
					tickSpacing: 56,
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

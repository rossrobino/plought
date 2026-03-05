<script lang="ts">
	import {
		type ChartConfig,
		ChartContainer,
		ChartTooltip,
	} from "$lib/components/ui/chart";
	import { BarChart } from "layerchart";

	interface MethodSeries {
		color: string;
		key: string;
		label: string;
		values: number[];
	}

	type ChartRow = Record<string, number | string>;

	interface Props {
		methods: MethodSeries[];
		rows: string[];
		xLabel?: string;
		yLabel?: string;
	}

	let { methods, rows, xLabel, yLabel }: Props = $props();

	const config = $derived.by(() => {
		const next: ChartConfig = {};
		for (const item of methods) {
			next[item.key] = { color: item.color, label: item.label };
		}
		return next;
	});

	const chartRows = $derived.by(() => {
		return rows.map((row, i) => {
			const next: ChartRow = { label: row };
			for (const method of methods) {
				next[method.key] = method.values[i] ?? 0;
			}
			return next;
		});
	});

	const chartSeries = $derived.by(() => {
		return methods.map((item) => {
			return {
				color: `var(--color-${item.key})`,
				key: item.key,
				label: item.label,
			};
		});
	});

	const maxValue = (row: ChartRow) => {
		let value = 0;
		for (const item of methods) {
			const next = Number(row[item.key] ?? 0);
			if (next > value) {
				value = next;
			}
		}
		return value;
	};

	const height = $derived(Math.max(300, rows.length * 66));
	const chartPadding = $derived.by(() => {
		const bottom = Math.min(
			84,
			Math.max(
				50,
				rows.reduce((max, row) => Math.max(max, row.length), 0) * 2.2 + 22,
			),
		);
		return { bottom, left: 96, right: 20, top: 12 };
	});
	const resolvedXLabel = $derived(xLabel ?? "Alternative");
	const resolvedYLabel = $derived(yLabel ?? "Score (0-10)");

	const formatValue = (value: number) => {
		if (!Number.isFinite(value)) {
			return "0";
		}
		return value.toFixed(2).replace(/\.?0+$/, "");
	};
</script>

<div class="sr-only">
	<table>
		<caption>
			{resolvedYLabel} values by {resolvedXLabel} and method.
		</caption>
		<thead>
			<tr>
				<th scope="col">{resolvedXLabel}</th>
				{#each methods as item (item.key)}
					<th scope="col">{item.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (`${row}-${i}`)}
				<tr>
					<th scope="row">{row}</th>
					{#each methods as item (item.key)}
						<td>{formatValue(item.values[i] ?? 0)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div aria-hidden="true">
	<ChartContainer
		{config}
		class="aspect-auto flex-col items-stretch justify-start gap-2 rounded-lg border bg-muted/20 p-2 shadow-xs"
	>
		<div class="w-full" style={`height:${height}px;`}>
			<BarChart
				data={chartRows}
				x={(d: ChartRow) => String(d.label ?? "")}
				y={maxValue}
				yDomain={[0, 10]}
				padding={chartPadding}
				series={chartSeries}
				seriesLayout="group"
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
					},
					yAxis: {
						label: resolvedYLabel,
						labelProps: { dx: 4 },
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
			{#each methods as item (item.key)}
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
</div>

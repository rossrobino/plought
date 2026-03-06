<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import ScoreBars from "$lib/components/output/charts/score-bars.svelte";
	import StackedBars from "$lib/components/output/charts/stacked-bars.svelte";
	import Scores from "$lib/components/scores/scores.svelte";
	import { Button } from "$lib/components/ui/button";
	import SectionHeader from "$lib/components/ui/section-header.svelte";
	import { allocation, alternatives, criteria } from "$lib/state";
	import {
		allocationTotal,
		getAllocateScores,
		normalizeAllocation,
	} from "$lib/util/allocate";
	import { getGuidanceCopy } from "$lib/util/analysis";
	import { chartColors } from "$lib/util/chart-colors";

	const allocationMatrix = $derived(
		normalizeAllocation(
			Array.isArray(allocation.current) ? allocation.current : [],
			criteria.current.length,
			alternatives.current.length,
		),
	);
	const allocateScores = $derived(
		getAllocateScores(allocationMatrix, criteria.current),
	);

	const contributionSeries = $derived.by(() => {
		return criteria.current.map((item, i) => {
			return {
				color: chartColors[i % chartColors.length],
				key: `criterion-${i}`,
				label: item.name,
				values: alternatives.current.map((_, altIndex) => {
					const points = allocationMatrix[i]?.[altIndex] ?? 0;
					return Number((((item.weight ?? 0) * points) / 10).toFixed(2));
				}),
			};
		});
	});

	const guidance = $derived(
		getGuidanceCopy({
			agreement: "none",
			alternatives: alternatives.current,
			method: "allocate",
		}),
	);
</script>

<Head title="Point Allocation" />

<section>
	<SectionHeader title="Point Allocation" desc={guidance.summary} />
	<p class="mt-3 mb-0 text-sm text-muted-foreground">{guidance.comparison}</p>
	<p class="mt-2 mb-0 text-sm text-muted-foreground">{guidance.caveat}</p>
	<div
		class="mt-3 space-y-2 rounded-lg border bg-muted/25 p-3 text-sm shadow-xs"
	>
		<p class="mb-0 font-medium">How this score is calculated</p>
		<p class="mb-0 text-muted-foreground">
			For each criterion, you distribute {allocationTotal} points across alternatives.
		</p>
		<p class="mb-0 text-muted-foreground">
			Each criterion contribution is:
			<code>(criterion weight) × (points ÷ 10)</code>
		</p>
		<p class="mb-0 text-muted-foreground">
			Final score for each alternative is:
			<code>Σ(weight × points/10) ÷ Σ(weights)</code>
		</p>
	</div>
	<div class="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
		<Button href="/setup/criteria" size="sm" variant="outline">
			Edit criteria
		</Button>
		<Button href="/setup/alternatives" size="sm" variant="outline">
			Edit alternatives
		</Button>
		<Button href="/allocate" size="sm" variant="outline">
			Edit allocations
		</Button>
	</div>
</section>

<section>
	<SectionHeader
		title="Allocation Totals"
		desc="Weighted 0-10 totals from per-criterion point splits."
	/>
	<div class="mt-3">
		<ScoreBars
			rows={alternatives.current.map((item) => item.name)}
			xLabel="Score (0-10)"
			yLabel="Alternative"
			series={[
				{
					color: chartColors[3],
					key: "allocate",
					label: "Point Allocation",
					values: allocateScores,
				},
			]}
		/>
	</div>
</section>

<section>
	<SectionHeader
		title="Weighted Contribution Breakdown"
		desc="Each stacked bar shows how criterion-level point allocations contribute to the final score."
	/>
	<div class="mt-3">
		<StackedBars
			rows={alternatives.current.map((item) => item.name)}
			xLabel="Alternative"
			yLabel="Weighted contribution"
			series={contributionSeries}
		/>
	</div>
</section>

<Scores allocate={true} sortBy="allocate" />

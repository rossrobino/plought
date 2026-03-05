<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import ScoreBars from "$lib/components/output/charts/score-bars.svelte";
	import StackedBars from "$lib/components/output/charts/stacked-bars.svelte";
	import Scores from "$lib/components/scores/scores.svelte";
	import { Button } from "$lib/components/ui/button";
	import { alternatives, criteria, rankOrder } from "$lib/state";
	import { getGuidanceCopy, getMethodScores } from "$lib/util/analysis";
	import { chartColors } from "$lib/util/chart-colors";

	const scores = $derived(
		getMethodScores(
			alternatives.current,
			criteria.current,
			Array.isArray(rankOrder.current) ? rankOrder.current : [],
		),
	);

	const contributionSeries = $derived.by(() => {
		return criteria.current.map((item, i) => {
			return {
				color: chartColors[i % chartColors.length],
				key: `criterion-${i}`,
				label: item.name,
				values: alternatives.current.map((alt) => {
					return Number(((item.weight ?? 0) * (alt.scores[i] ?? 0)).toFixed(2));
				}),
			};
		});
	});

	const guidance = $derived(
		getGuidanceCopy({
			agreement: "none",
			alternatives: alternatives.current,
			method: "weightedSum",
		}),
	);
</script>

<Head title="Weighted Sum" />

<section>
	<h2 class="mb-0">Weighted Sum</h2>
	<p class="mt-1 text-muted-foreground">{guidance.summary}</p>
	<p class="mt-3 mb-0 text-sm text-muted-foreground">{guidance.comparison}</p>
	<p class="mt-2 mb-0 text-sm text-muted-foreground">{guidance.caveat}</p>
	<div class="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
		<Button href="/setup/criteria" size="sm" variant="outline">
			Edit criteria
		</Button>
		<Button href="/setup/alternatives" size="sm" variant="outline">
			Edit alternatives
		</Button>
		<Button href="/weigh" size="sm" variant="outline">Weigh criteria</Button>
		<Button href="/score" size="sm" variant="outline">
			Score alternatives
		</Button>
	</div>
</section>

<section>
	<h2 class="mb-0">Weighted Totals</h2>
	<p class="mt-1 text-muted-foreground">
		Normalized 0-10 totals after applying current criterion weights.
	</p>
	<div class="mt-3">
		<ScoreBars
			rows={alternatives.current.map((item) => item.name)}
			xLabel="Score (0-10)"
			yLabel="Alternative"
			series={[
				{
					color: chartColors[0],
					key: "weighted",
					label: "Weighted",
					values: scores.normalized10.weightedSum,
				},
			]}
		/>
	</div>
</section>

<section>
	<h2 class="mb-0">Criterion Contribution Breakdown</h2>
	<p class="mt-1 text-muted-foreground">
		Each stacked bar shows how criterion-weighted contributions compose the
		total.
	</p>
	<div class="mt-3">
		<StackedBars
			rows={alternatives.current.map((item) => item.name)}
			series={contributionSeries}
			xLabel="Alternative"
			yLabel="Weighted contribution"
		/>
	</div>
</section>

<Scores weightedSum={true} sortBy="weightedSum" />

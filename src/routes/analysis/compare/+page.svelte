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

	const outcomes = $derived.by(() => {
		const wins = alternatives.current.map(() => 0);
		const ties = alternatives.current.map(() => 0);
		const losses = alternatives.current.map(() => 0);

		for (let i = 0; i < alternatives.current.length; i++) {
			const pairwise = alternatives.current[i]?.pairwise ?? [];
			for (let j = 0; j < pairwise.length; j++) {
				if (i === j) {
					continue;
				}
				const value = pairwise[j] ?? 0.5;
				if (value === 1) {
					wins[i] += 1;
				} else if (value === 0.5) {
					ties[i] += 1;
				} else {
					losses[i] += 1;
				}
			}
		}

		return { losses, ties, wins };
	});

	const guidance = $derived(
		getGuidanceCopy({
			agreement: "none",
			alternatives: alternatives.current,
			method: "pairwise",
		}),
	);
</script>

<Head title="Pairwise Comparison" />

<section>
	<h2 class="mb-0">Pairwise Comparison</h2>
	<p class="mt-1 text-muted-foreground">{guidance.summary}</p>
	<p class="mt-3 mb-0 text-sm text-muted-foreground">{guidance.comparison}</p>
	<p class="mt-2 mb-0 text-sm text-muted-foreground">{guidance.caveat}</p>
	<div class="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
		<Button href="/setup/alternatives" size="sm" variant="outline">
			Edit alternatives
		</Button>
		<Button href="/compare" size="sm" variant="outline">
			Edit pairwise inputs
		</Button>
	</div>
</section>

<section>
	<h2 class="mb-0">Pairwise Totals</h2>
	<p class="mt-1 text-muted-foreground">
		Normalized 0-10 totals based on head-to-head selections.
	</p>
	<div class="mt-3">
		<ScoreBars
			rows={alternatives.current.map((item) => item.name)}
			xLabel="Score (0-10)"
			yLabel="Alternative"
			series={[
				{
					color: chartColors[1],
					key: "pairwise",
					label: "Pairwise",
					values: scores.normalized10.pairwise,
				},
			]}
		/>
	</div>
</section>

<section>
	<h2 class="mb-0">Win/Tie/Loss Profile</h2>
	<p class="mt-1 text-muted-foreground">
		Each row shows the share of direct wins, ties, and losses.
	</p>
	<div class="mt-3">
		<StackedBars
			rows={alternatives.current.map((item) => item.name)}
			xLabel="Alternative"
			yLabel="Matchup count"
			series={[
				{
					color: chartColors[0],
					key: "wins",
					label: "Wins",
					values: outcomes.wins,
				},
				{
					color: chartColors[2],
					key: "ties",
					label: "Ties",
					values: outcomes.ties,
				},
				{
					color: chartColors[1],
					key: "losses",
					label: "Losses",
					values: outcomes.losses,
				},
			]}
		/>
	</div>
</section>

<Scores pairwise={true} sortBy="pairwise" />

<script lang="ts">
import Head from "$lib/components/Head.svelte";
import ScoreBars from "$lib/components/output/charts/score-bars.svelte";
import Scores from "$lib/components/scores/Scores.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import {
	alternatives,
	getRankScore,
	normalizeRankOrder,
		rankOrder,
	} from "$lib/state";
	import { getGuidanceCopy } from "$lib/util/analysis";
	import { chartColors } from "$lib/util/chart-colors";

	const rankedRows = $derived.by(() => {
		const order = normalizeRankOrder(
			Array.isArray(rankOrder.current) ? rankOrder.current : [],
			alternatives.current.length,
		);
		return order.map((altIndex, i) => {
			const name =
				alternatives.current[altIndex]?.name ?? `Alternative #${altIndex + 1}`;
			return {
				label: `#${i + 1} ${name}`,
				score: getRankScore(i, alternatives.current.length),
			};
		});
	});

	const guidance = $derived(
		getGuidanceCopy({
			agreement: "none",
			alternatives: alternatives.current,
			method: "rankOrder",
		}),
	);
</script>

<Head title="Rank Order" />

<section>
	<h2 class="mb-0">Rank Order</h2>
	<p class="mt-1 text-muted-foreground">{guidance.summary}</p>
	<p class="mt-3 mb-0 text-sm text-muted-foreground">{guidance.comparison}</p>
	<p class="mt-2 mb-0 text-sm text-muted-foreground">{guidance.caveat}</p>
	<div class="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
		<Button href="/setup/alternatives" size="sm" variant="outline">
			Edit alternatives
		</Button>
		<Button href="/rank" size="sm" variant="outline">
			Edit rank order
		</Button>
	</div>
</section>

<section>
	<h2 class="mb-0">Rank Position</h2>
	<p class="mt-1 text-muted-foreground">
		Top-to-bottom positions map directly to normalized 0-10 scores.
	</p>
	<div class="mt-3">
		<ScoreBars
			rows={rankedRows.map((item) => item.label)}
			xLabel="Score (0-10)"
			yLabel="Ranked option"
			series={[
				{
					color: chartColors[2],
					key: "rank",
					label: "Rank",
					values: rankedRows.map((item) => item.score),
				},
			]}
		/>
	</div>
</section>

<Scores rankOrder={true} sortBy="rankOrder" />

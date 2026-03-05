<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import MethodMatrixChart from "$lib/components/output/charts/method-matrix-chart.svelte";
	import Scores from "$lib/components/scores/scores.svelte";
	import { Button } from "$lib/components/ui/button";
	import {
		type MethodKey,
		allocation,
		alternatives,
		criteria,
		isMethodIncluded,
		rankOrder,
		toggleMethodIncluded,
	} from "$lib/state";
	import {
		getAgreementLevel,
		getConsensusRank,
		getConsensusScore10,
		getGuidanceCopy,
		getMethodRanks,
		getMethodScores,
	} from "$lib/util/analysis";
	import { chartColors } from "$lib/util/chart-colors";
	import {
		getRobustnessAnalysis,
		robustnessStrength,
	} from "$lib/util/robustness";

	const methods: {
		color: string;
		href: string;
		key: MethodKey;
		label: string;
		note: string;
	}[] = [
		{
			color: chartColors[0],
			href: "/analysis/weight",
			key: "weightedSum",
			label: "Weighted Sum",
			note: "Weighted totals and criterion contribution breakdown.",
		},
		{
			color: chartColors[1],
			href: "/analysis/compare",
			key: "pairwise",
			label: "Pairwise Comparison",
			note: "Head-to-head win, tie, and loss patterns.",
		},
		{
			color: chartColors[2],
			href: "/analysis/rank",
			key: "rankOrder",
			label: "Rank Order",
			note: "Ordinal ranking translated to a 0-10 score scale.",
		},
		{
			color: chartColors[3],
			href: "/analysis/allocate",
			key: "allocate",
			label: "Point Allocation",
			note: "Per-criterion point distribution across alternatives.",
		},
		{
			color: chartColors[4],
			href: "/analysis/topsis",
			key: "topsis",
			label: "TOPSIS",
			note: "Closeness to ideal and distance from worst profile.",
		},
	];

	const includedMethods = $derived.by(() => {
		return methods
			.filter((item) => isMethodIncluded(item.key))
			.map((item) => item.key);
	});

	const hasIncluded = $derived(
		methods.some((item) => isMethodIncluded(item.key)),
	);

	const scores = $derived(
		getMethodScores(
			alternatives.current,
			criteria.current,
			Array.isArray(rankOrder.current) ? rankOrder.current : [],
			Array.isArray(allocation.current) ? allocation.current : [],
		),
	);

	const methodRanks = $derived(getMethodRanks(scores.normalized10));
	const consensusScore10 = $derived(
		getConsensusScore10(scores.normalized10, includedMethods),
	);
	const consensus = $derived(
		getConsensusRank(methodRanks, includedMethods, consensusScore10),
	);
	const agreement = $derived(
		getAgreementLevel(consensus, methodRanks, includedMethods),
	);
	const guidance = $derived(
		getGuidanceCopy({
			agreement,
			alternatives: alternatives.current,
			consensus,
			includedMethods,
		}),
	);

	const comparisonSeries = $derived.by(() => {
		return methods
			.filter((item) => includedMethods.includes(item.key))
			.map((item) => {
				return {
					color: item.color,
					key: item.key,
					label: item.label,
					values: scores.normalized10[item.key],
				};
			});
	});

	const winnerName = $derived.by(() => {
		if (consensus.winnerIndex == null) {
			return "None";
		}
		return alternatives.current[consensus.winnerIndex]?.name ?? "None";
	});

	const winnerScore = $derived.by(() => {
		if (consensus.winnerIndex == null) {
			return null;
		}
		return consensusScore10[consensus.winnerIndex] ?? null;
	});

	const runnerName = $derived.by(() => {
		if (consensus.runnerUpIndex == null) {
			return null;
		}
		return alternatives.current[consensus.runnerUpIndex]?.name ?? null;
	});

	const agreementLabel = $derived.by(() => {
		return (
			{ high: "High", medium: "Medium", low: "Low", none: "None" }[agreement] ??
			"None"
		);
	});

	const hasRobustnessInputs = $derived(
		alternatives.current.length >= 2 && criteria.current.length >= 1,
	);

	const robustness = $derived.by(() => {
		if (!hasRobustnessInputs) {
			return null;
		}
		return getRobustnessAnalysis(
			alternatives.current,
			criteria.current,
			robustnessStrength,
		);
	});

	const winnerRobustness = $derived.by(() => {
		if (robustness == null || consensus.winnerIndex == null) {
			return null;
		}
		const name = alternatives.current[consensus.winnerIndex]?.name;
		if (name == null) {
			return null;
		}
		return (
			robustness.methods.combined.alternatives.find(
				(item) => item.name === name,
			) ?? null
		);
	});

	const sensitivityLabel = $derived.by(() => {
		if (winnerRobustness == null) {
			return null;
		}
		if (winnerRobustness.winRatePct >= 60) {
			return "Stable";
		}
		if (winnerRobustness.winRatePct >= 35) {
			return "Mixed";
		}
		return "Sensitive";
	});
</script>

<Head title="Summary" />

<section>
	<h2 class="mb-0">Included Methods</h2>
	<p class="mt-1 text-muted-foreground">
		Toggle which methods appear in summary guidance and score tables.
	</p>
	<div class="mt-3 flex flex-wrap gap-2">
		{#each methods as item (item.key)}
			{@const included = isMethodIncluded(item.key)}
			<Button
				size="sm"
				variant={included ? "secondary" : "outline"}
				aria-pressed={included}
				onclick={() => toggleMethodIncluded(item.key)}
			>
				{item.label}
			</Button>
		{/each}
	</div>
</section>

{#if hasIncluded}
	<section>
		<h2 class="mb-0">Recommendation</h2>
		<p class="mt-1 text-muted-foreground">{guidance.summary}</p>
		<div class="mt-3 grid gap-3 sm:grid-cols-3">
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<p class="mb-0 text-xs tracking-wide text-muted-foreground uppercase">
					Recommended Option
				</p>
				<p class="mt-1 mb-0 truncate text-base font-semibold">{winnerName}</p>
				{#if winnerScore != null}
					<p class="mt-1 mb-0 text-xs text-muted-foreground">
						Consensus score {winnerScore.toFixed(2)} / 10
					</p>
				{/if}
			</div>
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<p class="mb-0 text-xs tracking-wide text-muted-foreground uppercase">
					Agreement Level
				</p>
				<p class="mt-1 mb-0 text-base font-semibold">{agreementLabel}</p>
				<p class="mt-1 mb-0 text-xs text-muted-foreground">
					{guidance.comparison}
				</p>
				{#if winnerRobustness != null && sensitivityLabel != null}
					<p class="mt-2 mb-0 text-xs text-muted-foreground">
						Weight sensitivity:
						<a
							href="/analysis/robustness"
							class="font-medium text-foreground underline-offset-2 hover:underline"
						>
							{sensitivityLabel}
						</a>
						({winnerRobustness.winRatePct.toFixed(2)}% hold rate)
					</p>
				{/if}
			</div>
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<p class="mb-0 text-xs tracking-wide text-muted-foreground uppercase">
					Runner-up Gap
				</p>
				{#if runnerName == null}
					<p class="mt-1 mb-0 text-base font-semibold">-</p>
				{:else}
					<p class="mt-1 mb-0 text-base font-semibold">
						{consensus.runnerUpGap.toFixed(2)} pts
					</p>
					<p class="mt-1 mb-0 text-xs text-muted-foreground">
						vs {runnerName}
					</p>
				{/if}
			</div>
		</div>
		<p class="mt-3 mb-0 text-sm text-muted-foreground">{guidance.caveat}</p>
	</section>

	<section>
		<h2 class="mb-0">Cross-Method Analysis</h2>
		<p class="mt-1 text-muted-foreground">
			Each row shows normalized 0-10 scores for included methods.
		</p>
		<div class="mt-3">
			<MethodMatrixChart
				rows={alternatives.current.map((item) => item.name)}
				methods={comparisonSeries}
				xLabel="Alternative"
				yLabel="Score (0-10)"
			/>
		</div>
	</section>

	<section>
		<h2 class="mb-0">Method Details</h2>
		<p class="mt-1 text-muted-foreground">
			Open any method for detailed charts and plain-language explanations.
		</p>
		<div class="mt-3 grid gap-3 sm:grid-cols-2">
			{#each methods as item (item.key)}
				<a
					href={item.href}
					class="block rounded-lg border p-3 no-underline shadow-xs hover:bg-accent/35"
				>
					<p class="mb-0 text-sm font-semibold">{item.label}</p>
					<p class="mt-1 mb-0 text-xs text-muted-foreground">{item.note}</p>
				</a>
			{/each}
			<a
				href="/analysis/robustness"
				class="block rounded-lg border p-3 no-underline shadow-xs hover:bg-accent/35"
			>
				<p class="mb-0 text-sm font-semibold">Robustness</p>
				<p class="mt-1 mb-0 text-xs text-muted-foreground">
					Stability of recommendations under simulated weight variation.
				</p>
			</a>
		</div>
	</section>

	<Scores
		weightedSum={isMethodIncluded("weightedSum")}
		pairwise={isMethodIncluded("pairwise")}
		rankOrder={isMethodIncluded("rankOrder")}
		allocate={isMethodIncluded("allocate")}
		topsis={isMethodIncluded("topsis")}
	/>
{:else}
	<section>
		<h2 class="mb-0">No Methods Included</h2>
		<p class="mt-1 text-muted-foreground">
			Enable one or more methods above to view guidance and scores.
		</p>
	</section>
{/if}

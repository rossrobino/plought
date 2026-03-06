<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import ScoreBars from "$lib/components/output/charts/score-bars.svelte";
	import { Button } from "$lib/components/ui/button";
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import * as Field from "$lib/components/ui/field";
	import { Input } from "$lib/components/ui/input";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import * as Table from "$lib/components/ui/table";
	import { alternatives, criteria } from "$lib/state";
	import { chartColors } from "$lib/util/chart-colors";
	import {
		getRobustnessAnalysis,
		robustnessRuns,
		robustnessStrength,
	} from "$lib/util/robustness";

	let perturbationPct = $state(Math.round(robustnessStrength * 100));

	const clampPerturbation = () => {
		const value = Number(perturbationPct);
		if (!Number.isFinite(value)) {
			perturbationPct = Math.round(robustnessStrength * 100);
			return;
		}
		perturbationPct = Math.max(0, Math.min(100, Math.round(value)));
	};

	const perturbationStrength = $derived.by(() => {
		const value = Number(perturbationPct);
		if (!Number.isFinite(value)) {
			return robustnessStrength;
		}
		return Math.max(0, Math.min(100, value)) / 100;
	});

	const hasInputs = $derived(
		alternatives.current.length >= 2 && criteria.current.length >= 1,
	);

	const robustness = $derived.by(() => {
		if (!hasInputs) {
			return null;
		}
		return getRobustnessAnalysis(
			alternatives.current,
			criteria.current,
			perturbationStrength,
		);
	});

	const rows = $derived.by(() => {
		if (robustness == null) {
			return alternatives.current.map((item) => item.name);
		}
		return robustness.methods.weightedSum.alternatives.map((item) => item.name);
	});

	const winRateSeries = $derived.by(() => {
		if (robustness == null) {
			return [];
		}
		return [
			{
				color: chartColors[0],
				key: "weighted",
				label: "Weighted Sum",
				values: robustness.methods.weightedSum.alternatives.map(
					(item) => item.winRatePct,
				),
			},
			{
				color: chartColors[3] ?? chartColors[1],
				key: "topsis",
				label: "TOPSIS",
				values: robustness.methods.topsis.alternatives.map(
					(item) => item.winRatePct,
				),
			},
			{
				color: chartColors[1],
				key: "combined",
				label: "Combined",
				values: robustness.methods.combined.alternatives.map(
					(item) => item.winRatePct,
				),
			},
		];
	});

	const getWinner = (key: "weightedSum" | "topsis" | "combined") => {
		if (robustness == null) {
			return null;
		}
		const method = robustness.methods[key];
		if (method.winnerIndex == null) {
			return null;
		}
		return method.alternatives[method.winnerIndex] ?? null;
	};

	const weightedWinner = $derived(getWinner("weightedSum"));
	const topsisWinner = $derived(getWinner("topsis"));
	const combinedWinner = $derived(getWinner("combined"));
</script>

<Head title="Robustness" />

<section>
	<h2 class="mb-0">Robustness</h2>
	<p class="mt-1 text-muted-foreground">
		Robustness shows how often each alternative still wins when criterion
		weights shift a little.
	</p>
	<p class="mt-2 mb-0 text-sm text-muted-foreground">
		This view runs {robustnessRuns} random simulations and changes each weight by
		up to {Math.round(perturbationStrength * 100)}% on each run.
	</p>
	<p class="mt-1 mb-0 text-sm text-muted-foreground">
		This helps check whether your top-ranked option still holds up even if
		criterion weights are not perfectly tuned.
	</p>
	<div class="mt-3 max-w-xs">
		<Field.Field>
			<Field.Label for="robustness-perturbation">
				Weight change range (%)
			</Field.Label>
			<Input
				type="number"
				id="robustness-perturbation"
				name="robustness-perturbation"
				min="0"
				max="100"
				step="1"
				inputmode="numeric"
				bind:value={perturbationPct}
				onblur={clampPerturbation}
			/>
			<Field.Description>
				How much each criterion weight can randomly move up or down per run.
			</Field.Description>
		</Field.Field>
	</div>
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

{#if !hasInputs || robustness == null}
	<section>
		<h2 class="mb-0">Not Enough Data</h2>
		<p class="mt-1 text-muted-foreground">
			Add at least 2 alternatives and 1 criterion to run robustness analysis.
		</p>
	</section>
{:else}
	<section>
		<h2 class="mb-0">Most Robust by Method</h2>
		<p class="mt-1 text-muted-foreground">
			The option with the highest win rate after many weight changes.
		</p>
		<div class="mt-3 grid gap-3 sm:grid-cols-3">
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<Eyebrow variant="subtle" class="mb-0">Weighted Sum</Eyebrow>
				<p class="mt-1 mb-0 truncate text-base font-semibold">
					{weightedWinner?.name ?? "-"}
				</p>
				<p class="mt-1 mb-0 text-xs text-muted-foreground">
					Win rate {weightedWinner?.winRatePct.toFixed(2) ?? "0.00"}%
				</p>
			</div>
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<Eyebrow variant="subtle" class="mb-0">TOPSIS</Eyebrow>
				<p class="mt-1 mb-0 truncate text-base font-semibold">
					{topsisWinner?.name ?? "-"}
				</p>
				<p class="mt-1 mb-0 text-xs text-muted-foreground">
					Win rate {topsisWinner?.winRatePct.toFixed(2) ?? "0.00"}%
				</p>
			</div>
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<Eyebrow variant="subtle" class="mb-0">Combined</Eyebrow>
				<p class="mt-1 mb-0 truncate text-base font-semibold">
					{combinedWinner?.name ?? "-"}
				</p>
				<p class="mt-1 mb-0 text-xs text-muted-foreground">
					Win rate {combinedWinner?.winRatePct.toFixed(2) ?? "0.00"}%
				</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="mb-0">Win Rate by Method</h2>
		<p class="mt-1 text-muted-foreground">
			Percent of runs where each alternative finishes first.
		</p>
		<div class="mt-3">
			<ScoreBars
				{rows}
				max={100}
				xLabel="Win rate (%)"
				yLabel="Alternative"
				series={winRateSeries}
			/>
		</div>
	</section>

	<section>
		<h2 class="mb-0">Stability Details</h2>
		<p class="mt-1 text-muted-foreground">
			Lower average rank is better. Combined worst rank shows downside.
		</p>
		<ScrollArea
			class="mt-3 w-full rounded-md border whitespace-nowrap"
			orientation="horizontal"
		>
			<Table.Root class="min-w-full">
				<caption class="sr-only">
					Robustness simulation results by alternative.
				</caption>
				<Table.Header>
					<Table.Row
						class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent"
					>
						<Table.Head>Alternative</Table.Head>
						<Table.Head>Weighted Win %</Table.Head>
						<Table.Head>Weighted Avg Rank</Table.Head>
						<Table.Head>TOPSIS Win %</Table.Head>
						<Table.Head>TOPSIS Avg Rank</Table.Head>
						<Table.Head>Combined Win %</Table.Head>
						<Table.Head>Combined Avg Rank</Table.Head>
						<Table.Head>Combined Worst Rank</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each rows as row, i (`robustness-${i}-${row}`)}
						{@const weighted = robustness.methods.weightedSum.alternatives[i]}
						{@const topsis = robustness.methods.topsis.alternatives[i]}
						{@const combined = robustness.methods.combined.alternatives[i]}
						<Table.Row>
							<Table.Head scope="row" class="font-semibold">
								{weighted?.name ?? `Alternative #${i + 1}`}
							</Table.Head>
							<Table.Cell>
								{weighted?.winRatePct.toFixed(2) ?? "0.00"}%
							</Table.Cell>
							<Table.Cell>{weighted?.avgRank.toFixed(2) ?? "0.00"}</Table.Cell>
							<Table.Cell>
								{topsis?.winRatePct.toFixed(2) ?? "0.00"}%
							</Table.Cell>
							<Table.Cell>{topsis?.avgRank.toFixed(2) ?? "0.00"}</Table.Cell>
							<Table.Cell>
								{combined?.winRatePct.toFixed(2) ?? "0.00"}%
							</Table.Cell>
							<Table.Cell>{combined?.avgRank.toFixed(2) ?? "0.00"}</Table.Cell>
							<Table.Cell>
								{combined?.worstRank.toFixed(2) ?? "0.00"}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
	</section>
{/if}

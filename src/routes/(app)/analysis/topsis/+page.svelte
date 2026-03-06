<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import TopsisDistanceMap from "$lib/components/output/charts/topsis-distance-map.svelte";
	import Scores from "$lib/components/scores/scores.svelte";
	import { Button } from "$lib/components/ui/button";
	import SectionHeader from "$lib/components/ui/section-header.svelte";
	import { alternatives, criteria } from "$lib/state";
	import { getGuidanceCopy } from "$lib/util/analysis";
	import { getTopsisDiagnostics } from "$lib/util/topsis";

	const diagnostics = $derived(
		getTopsisDiagnostics(alternatives.current, criteria.current),
	);

	const guidance = $derived(
		getGuidanceCopy({
			agreement: "none",
			alternatives: alternatives.current,
			method: "topsis",
		}),
	);
</script>

<Head title="TOPSIS" />

<section>
	<SectionHeader
		title="TOPSIS"
		desc="TOPSIS stands for Technique for Order Preference by Similarity to Ideal Solution."
		descClass="text-sm"
	/>
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
	<SectionHeader
		title="Closeness"
		desc="Each alternative appears once on the TOPSIS closeness axis."
	/>
	<div class="mt-3">
		<TopsisDistanceMap
			rows={alternatives.current.map((item) => item.name)}
			best={diagnostics.distanceBest}
			worst={diagnostics.distanceWorst}
		/>
	</div>
</section>

<Scores topsis={true} sortBy="topsis" />

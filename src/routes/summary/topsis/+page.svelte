<script lang="ts">
	import TopsisDistanceMap from "$lib/components/output/charts/topsis-distance-map.svelte";
	import Head from "$lib/components/Head.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
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
	<h2 class="mb-0">TOPSIS</h2>
	<p class="mt-1 text-sm text-muted-foreground">
		TOPSIS stands for Technique for Order Preference by Similarity to Ideal Solution.
	</p>
	<p class="mt-1 text-muted-foreground">{guidance.summary}</p>
	<p class="mt-3 mb-0 text-sm text-muted-foreground">{guidance.comparison}</p>
	<p class="mt-2 mb-0 text-sm text-muted-foreground">{guidance.caveat}</p>
</section>

<section>
	<h2 class="mb-0">Closeness</h2>
	<p class="mt-1 text-muted-foreground">
		Each alternative appears once on the TOPSIS closeness axis.
	</p>
	<div class="mt-3">
		<TopsisDistanceMap
			rows={alternatives.current.map((item) => item.name)}
			best={diagnostics.distanceBest}
			worst={diagnostics.distanceWorst}
		/>
	</div>
</section>

<Scores topsis={true} sortBy="topsis" />

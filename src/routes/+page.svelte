<script lang="ts">
	import { info, apps } from "$lib/info";
	import Head from "$lib/components/Head.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
</script>

<Head desc={info.tagline} />

<div id="apps" class="grid gap-4 sm:grid-cols-2">
	{#each apps as app}
		<div class="rounded bg-stone-200 p-4">
			<a class="text-xl capitalize" href={app.path}>
				{app.title}
			</a>
			<p>{app.desc}</p>
		</div>
	{/each}
</div>

<Scores weightedSum={true} pairwise={true} />

<h2>About</h2>
<p>
	Decision making is difficult, especially when there are many different
	alternatives and criteria to base the decision on.
</p>
<p>
	<i>{info.name}</i>
	is a collection of decision making applications. Each app uses different methods
	to evaluate alternatives against each other.
	<i>{info.name}</i>
	aims to reduce
	<a
		href="https://en.wikipedia.org/wiki/Noise:_A_Flaw_in_Human_Judgment#:~:text=The%20book%20concerns%20'noise'%20in,psychological%20perspectives%20of%20the%20issue."
	>
		noise
	</a>
	in decision making by encouraging independent judgement, and reducing subjectivity.
</p>
<p>
	While <i>{info.name}</i>
	can help guide and reveal surprising results, many decisions are subjective (including
	inputs into the application). It is hard to be able to accurately account for each
	possible alternative and criteria. Use
	<i>{info.name}</i>
	as a tool, ultimately the decision is up to you!
</p>
<p>
	<a href="#apps">Select an app</a>
	above to get started.
</p>

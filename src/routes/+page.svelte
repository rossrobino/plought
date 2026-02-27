<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import Scores from "$lib/components/scores/Scores.svelte";
	import { apps, info } from "$lib/info";
</script>

<Head desc={info.tagline} />

<div class="grid gap-4 sm:grid-cols-2">
	{#each apps as app}
		<a href={app.path} class="group block no-underline">
			<div class="rounded-xl border bg-card p-4 shadow-sm transition-colors group-hover:bg-accent/40">
				<div class="text-xl font-semibold capitalize">{app.title}</div>
				<p class="mt-2">{app.desc}</p>
			</div>
		</a>
	{/each}
</div>

<Scores weightedSum={true} pairwise={true} />

<section class="border-secondary/30 bg-secondary text-secondary-foreground">
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
		can help guide in decision making, and reveal surprising results, many decisions
		are subjective (including inputs into the application). It is hard to be able
		to accurately account for each possible alternative and criteria. Use
		<i>{info.name}</i>
		as a tool, ultimately the decision is up to you!
	</p>
</section>

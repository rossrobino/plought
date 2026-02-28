<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import { apps, info } from "$lib/info";
</script>

<Head desc={info.tagline} />

<section>
	<h2>Apps</h2>
	<p class="text-muted-foreground">
		Use one of the decision methods below to evaluate alternatives.
	</p>
	<div class="grid gap-4 sm:grid-cols-2">
		{#each apps as app}
			<a href={app.path} class="group block no-underline">
				<div class="rounded-xl border bg-card p-4 shadow-sm transition-colors group-hover:bg-accent/40">
					<div class="text-xl font-semibold capitalize">{app.title}</div>
					<p class="mt-2 text-muted-foreground">{app.desc}</p>
				</div>
			</a>
		{/each}
	</div>
</section>

<a href="/scores" class="group mt-8 block no-underline">
	<div class="rounded-xl border border-primary/30 bg-primary/10 p-4 shadow-sm transition-colors group-hover:bg-primary/20">
		<h2>Summary</h2>
		<p class="text-muted-foreground">
			View combined weighted-sum and pairwise rankings in one place.
		</p>
	</div>
</a>

<section class="border-secondary/30 bg-secondary text-secondary-foreground">
	<div class="mb-5">
		<h2>About {info.name}</h2>
		<p>
			A practical toolkit for making high-stakes choices with less bias and more
			structure.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-[2fr,1fr]">
		<div class="space-y-4">
			<p class="text-base leading-relaxed">
				Decision making is difficult, especially when there are many alternatives
				and criteria to weigh.
				<i>{info.name}</i>
				uses proven scoring methods to turn complex choices into clear comparisons.
			</p>
			<p>
				The goal is to reduce
				<a
					href="https://en.wikipedia.org/wiki/Noise:_A_Flaw_in_Human_Judgment#:~:text=The%20book%20concerns%20'noise'%20in,psychological%20perspectives%20of%20the%20issue."
					class="text-secondary-foreground decoration-secondary-foreground"
				>
					noise
				</a>
				in judgment by encouraging independent scoring and consistent criteria.
			</p>
			<p>
				Use results as a guide, not a verdict. Inputs are still human and subjective,
				so final decisions remain yours.
			</p>
		</div>

		<div class="rounded-lg border border-secondary-foreground/20 bg-secondary-foreground/10 p-4">
			<p class="mb-3 text-xs font-semibold tracking-wide uppercase">
				Core Principles
			</p>
			<div class="space-y-2 text-sm">
				<p>Score options independently.</p>
				<p>Let weights reflect priorities.</p>
				<p>Compare outcomes before deciding.</p>
			</div>
		</div>
	</div>
</section>

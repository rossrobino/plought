<script lang="ts">
	import Head from "$lib/components/Head.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { apps, info } from "$lib/info";
	import { alternatives, criteria } from "$lib/state";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import GitCompareIcon from "@lucide/svelte/icons/git-compare";
	import ScaleIcon from "@lucide/svelte/icons/scale";

	const getAppMeta = (path: string) => {
		if (path === "/weighted-sum") {
			return { icon: ScaleIcon, badge: "Weighted criteria" };
		}
		return { icon: GitCompareIcon, badge: "Head-to-head" };
	};
</script>

<div class="mx-auto w-full max-w-[80ch]">
	<Head desc={info.tagline} />

	<section>
		<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
			Make better decisions with less noise.
		</h1>
		<p class="text-muted-foreground">
			Use one or more decision methods below to evaluate alternatives from
			different angles.
		</p>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each apps as app (app.path)}
				{@const meta = getAppMeta(app.path)}
				<a href={app.path} class="group block no-underline">
					<div
						class="h-full rounded-xl border bg-card p-3 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:bg-accent/35"
					>
						<div class="flex items-start justify-between gap-2">
							<div
								class="inline-flex size-9 items-center justify-center rounded-md border bg-background"
							>
								<meta.icon class="size-4" />
							</div>
							<span
								class="rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
							>
								{meta.badge}
							</span>
						</div>
						<div class="mt-3 text-xl font-semibold capitalize">{app.title}</div>
						<p class="mt-2 text-muted-foreground">{app.desc}</p>
						<div
							class="mt-4 inline-flex items-center gap-1 text-sm font-medium"
						>
							Open app
							<ArrowRightIcon
								class="size-4 transition-transform group-hover:translate-x-0.5"
							/>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<a href="/scores" class="group block no-underline">
		<section
			class="border-primary/35 bg-primary/10 transition-colors group-hover:bg-primary/15"
		>
			<div class="flex items-start justify-between gap-3">
				<div>
					<h2 class="mb-0">Summary</h2>
					<p class="mt-1 text-muted-foreground">
						Compare Weighted Sum and Pairwise rankings side by side.
					</p>
				</div>
				<div
					class="inline-flex size-9 items-center justify-center rounded-md border border-primary/40 bg-background/70"
				>
					<BarChart3Icon class="size-4" />
				</div>
			</div>
			<Separator class="my-3" />
			<div class="grid gap-2 text-sm sm:grid-cols-3">
				<div
					class="rounded-md border bg-card/70 px-2.5 py-1.5 text-muted-foreground"
				>
					<span class="font-semibold text-foreground">{apps.length}</span>
					 methods
				</div>
				<div
					class="rounded-md border bg-card/70 px-2.5 py-1.5 text-muted-foreground"
				>
					<span class="font-semibold text-foreground">
						{criteria.current.length}
					</span>
					 criteria
				</div>
				<div
					class="rounded-md border bg-card/70 px-2.5 py-1.5 text-muted-foreground"
				>
					<span class="font-semibold text-foreground">
						{alternatives.current.length}
					</span>
					 alternatives
				</div>
			</div>
		</section>
	</a>

	<section class="border-secondary/30 bg-secondary text-secondary-foreground">
		<div>
			<h2>How It Works</h2>
			<p class="text-secondary-foreground/90">
				{info.name} turns complex choices into structured comparisons by separating
				inputs from outcomes. You define criteria, score alternatives, and compare
				results across methods before deciding.
			</p>
			<p class="mt-2 text-secondary-foreground/90">
				This keeps the process consistent and reduces judgment noise, especially
				when decisions involve many tradeoffs.
			</p>
		</div>
		<div class="mt-3 grid gap-2 text-sm sm:grid-cols-3">
			<div
				class="rounded-lg border border-secondary-foreground/20 bg-secondary-foreground/10 p-3"
			>
				<p class="font-medium">Score independently</p>
				<p class="mt-1 text-secondary-foreground/90">
					Rate each alternative without comparing everything at once.
				</p>
			</div>
			<div
				class="rounded-lg border border-secondary-foreground/20 bg-secondary-foreground/10 p-3"
			>
				<p class="font-medium">Weight priorities</p>
				<p class="mt-1 text-secondary-foreground/90">
					Let important criteria contribute more to your result.
				</p>
			</div>
			<div
				class="rounded-lg border border-secondary-foreground/20 bg-secondary-foreground/10 p-3"
			>
				<p class="font-medium">Compare outcomes</p>
				<p class="mt-1 text-secondary-foreground/90">
					Review method outputs together before making a final choice.
				</p>
			</div>
		</div>
		<p class="mt-3 text-sm text-secondary-foreground/90">
			Use results as guidance, not a verdict. Final decisions are still yours.
		</p>
	</section>
</div>

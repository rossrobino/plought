<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import { Progress } from "$lib/components/ui/progress";
	import { Separator } from "$lib/components/ui/separator";
	import { apps, info } from "$lib/info";
	import {
		alternatives,
		criteria,
		isAppUsed,
		isSetupStepUsed,
	} from "$lib/state";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import FlagIcon from "@lucide/svelte/icons/flag";

	const setupSteps = ["start", "alternatives", "criteria"] as const;

	const setupProgress = $derived.by(() => {
		const total = setupSteps.length;
		const done = setupSteps.reduce((count, step) => {
			return count + (isSetupStepUsed(step) ? 1 : 0);
		}, 0);
		return { done, total, percent: Math.round((done / total) * 100) };
	});

	const appProgress = $derived.by(() => {
		const total = apps.length;
		const done = apps.reduce((count, app) => {
			return count + (isAppUsed(app.key) ? 1 : 0);
		}, 0);
		if (total === 0) {
			return { done, total, percent: 0 };
		}
		return { done, total, percent: Math.round((done / total) * 100) };
	});
</script>

<div class="w-full space-y-4 pt-4">
	<Head desc={info.tagline} />

	<section class="border-accent/70 bg-accent/45 text-foreground">
		<div>
			<h2 class="mb-0 text-2xl tracking-tight sm:text-3xl">
				{info.tagline}
			</h2>
			<p class="mt-3 mb-0 text-muted-foreground">
				Use one or more methods to evaluate alternatives from different angles.
				{info.name} turns complex choices into structured comparisons by separating
				inputs from outcomes.
			</p>
			<p class="mt-3 mb-0 text-muted-foreground">
				Define criteria, score alternatives, and compare results before
				deciding. This keeps the process consistent and reduces judgment noise
				when tradeoffs are involved.
			</p>
		</div>
		<div class="mt-5 grid gap-3 text-sm sm:grid-cols-3">
			<div
				class="rounded-lg border border-accent/70 bg-background/85 p-3 shadow-xs"
			>
				<p class="mb-0 font-medium">Encourage independent judgment</p>
				<p class="mt-1 mb-0 text-muted-foreground">
					Decision making is difficult when many alternatives and criteria are
					involved. Evaluate each option on its own first to reduce noise.
				</p>
			</div>
			<div
				class="rounded-lg border border-accent/70 bg-background/85 p-3 shadow-xs"
			>
				<p class="mb-0 font-medium">Weight priorities</p>
				<p class="mt-1 mb-0 text-muted-foreground">
					Let important criteria contribute more to your result.
				</p>
			</div>
			<div
				class="rounded-lg border border-accent/70 bg-background/85 p-3 shadow-xs"
			>
				<p class="mb-0 font-medium">Compare outcomes</p>
				<p class="mt-1 mb-0 text-muted-foreground">
					Review method outputs together before making a final choice.
				</p>
			</div>
		</div>
		<p class="mt-4 mb-0 text-sm text-muted-foreground">
			Use results as guidance, not a verdict. Final decisions are still yours.
		</p>
	</section>

	<a href="/setup" class="group block no-underline" data-card-link>
		<div
			class="rounded-lg border bg-card p-3 shadow-xs transition-colors group-hover:bg-accent/35"
		>
			<div class="flex items-start justify-between gap-3">
				<div>
					<h2 class="mb-0">Get Started</h2>
					<p class="mt-1 text-muted-foreground">
						Set up your decision title, goal, and alternatives before scoring.
					</p>
				</div>
				<div
					class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background"
				>
					<FlagIcon class="size-4" />
				</div>
			</div>
			<div class="mt-3 inline-flex items-center gap-1 text-sm font-medium">
				Open setup
				<ArrowRightIcon
					class="size-4 transition-transform group-hover:translate-x-0.5"
				/>
			</div>
		</div>
	</a>

	<section class="rounded-lg border bg-card p-3 shadow-xs">
		<div class="flex items-start justify-between gap-3">
			<div>
				<h2 class="mb-0">Progress</h2>
				<p class="mt-1 text-muted-foreground">
					Track setup and app progress as you work through your decision.
				</p>
			</div>
			<div
				class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background"
			>
				<BarChart3Icon class="size-4" />
			</div>
		</div>
		<Separator class="my-3" />
		<div class="grid gap-2 sm:grid-cols-2">
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<div class="flex items-center justify-between gap-2">
					<p class="mb-0 text-xs tracking-wide text-muted-foreground uppercase">
						Setup
					</p>
					<p class="mb-0 text-sm font-medium text-foreground">
						{setupProgress.done}/{setupProgress.total}
					</p>
				</div>
				<Progress
					class="mt-2"
					max={100}
					value={setupProgress.percent}
					aria-label={`Setup progress: ${setupProgress.done} of ${setupProgress.total}`}
				/>
				<p class="mt-2 mb-0 text-xs text-muted-foreground">
					{setupProgress.percent}% complete
				</p>
			</div>
			<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
				<div class="flex items-center justify-between gap-2">
					<p class="mb-0 text-xs tracking-wide text-muted-foreground uppercase">
						App
					</p>
					<p class="mb-0 text-sm font-medium text-foreground">
						{appProgress.done}/{appProgress.total}
					</p>
				</div>
				<Progress
					class="mt-2"
					max={100}
					value={appProgress.percent}
					aria-label={`App progress: ${appProgress.done} of ${appProgress.total}`}
				/>
				<p class="mt-2 mb-0 text-xs text-muted-foreground">
					{appProgress.percent}% complete
				</p>
			</div>
		</div>
	</section>

	<div class="mt-4 grid gap-4 sm:grid-cols-2">
		{#each apps as app (app.path)}
			<a href={app.path} class="group block no-underline" data-card-link>
				<div
					class="h-full rounded-lg border bg-card p-3 shadow-xs transition-colors group-hover:bg-accent/35"
				>
					<div class="flex items-start justify-between gap-2">
						<div
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background"
						>
							<app.icon class="size-4" />
						</div>
						<span
							class="rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
						>
							{app.badge}
						</span>
					</div>
					<div class="mt-3 text-xl font-semibold capitalize">{app.title}</div>
					<p class="mt-2 text-muted-foreground">{app.desc}</p>
					<div class="mt-4 inline-flex items-center gap-1 text-sm font-medium">
						Open app
						<ArrowRightIcon
							class="size-4 transition-transform group-hover:translate-x-0.5"
						/>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<a href="/analysis" class="group block no-underline" data-card-link>
		<section
			class="border-primary/35 bg-primary/10 transition-colors group-hover:bg-primary/15"
		>
			<div class="flex items-start justify-between gap-3">
				<div>
					<h2 class="mb-0">Summary</h2>
					<p class="mt-1 text-muted-foreground">
						Compare Weighted Sum, Pairwise, Rank, and TOPSIS side by side.
					</p>
				</div>
				<div
					class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-background/70"
				>
					<BarChart3Icon class="size-4" />
				</div>
			</div>
			<Separator class="my-3" />
			<div class="grid gap-2 sm:grid-cols-2">
				<div class="rounded-lg border bg-card/70 p-3 shadow-xs">
					<p class="mb-0 text-xs tracking-wide text-muted-foreground uppercase">
						Criteria
					</p>
					<p
						class="mt-1 mb-0 text-2xl leading-none font-semibold text-foreground"
					>
						{criteria.current.length}
					</p>
				</div>
				<div class="rounded-lg border bg-card/70 p-3 shadow-xs">
					<p class="mb-0 text-xs tracking-wide text-muted-foreground uppercase">
						Alternatives
					</p>
					<p
						class="mt-1 mb-0 text-2xl leading-none font-semibold text-foreground"
					>
						{alternatives.current.length}
					</p>
				</div>
			</div>
		</section>
	</a>
</div>

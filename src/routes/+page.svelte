<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	import SectionHeader from "$lib/components/ui/section-header.svelte";
	import StatCard from "$lib/components/ui/stat-card.svelte";
	import { apps, info } from "$lib/info";
	import {
		type MethodKey,
		type SetupStepKey,
		allocation,
		alternatives,
		criteria,
		decision,
		isAppUsed,
		isMethodIncluded,
		isSetupStepUsed,
		rankOrder,
	} from "$lib/state";
	import {
		getHomeNextStep,
		getHomePreview,
		homeSetupItems,
	} from "$lib/util/home";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import FlagIcon from "@lucide/svelte/icons/flag";
	import GitForkIcon from "@lucide/svelte/icons/git-fork";
	import ListChecksIcon from "@lucide/svelte/icons/list-checks";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";

	const methodKeys = [
		"weightedSum",
		"pairwise",
		"rankOrder",
		"allocate",
		"topsis",
	] as const satisfies readonly MethodKey[];

	const setupIcons: Record<
		SetupStepKey,
		typeof FlagIcon | typeof GitForkIcon | typeof ListChecksIcon
	> = { start: FlagIcon, alternatives: GitForkIcon, criteria: ListChecksIcon };

	const stages = [
		{
			href: "#journey-setup",
			icon: FlagIcon,
			label: "Setup",
			note: "Define the decision, the alternatives, and the criteria before you touch a scoring model.",
			number: "01",
		},
		{
			href: "#journey-evaluate",
			icon: BarChart3Icon,
			label: "Evaluate",
			note: "Use the tools to compare tradeoffs from different angles.",
			number: "02",
		},
		{
			href: "#journey-decide",
			icon: ShieldCheckIcon,
			label: "Decide",
			note: "Review the summary and check stability before locking in the final choice.",
			number: "03",
		},
	] as const;

	const setupUsed = $derived.by(() => {
		return {
			start: isSetupStepUsed("start"),
			alternatives: isSetupStepUsed("alternatives"),
			criteria: isSetupStepUsed("criteria"),
		};
	});

	const appUsed = $derived.by(() => {
		return {
			weigh: isAppUsed("weigh"),
			score: isAppUsed("score"),
			compare: isAppUsed("compare"),
			rank: isAppUsed("rank"),
			allocate: isAppUsed("allocate"),
		};
	});

	const includedMethods = $derived.by(() => {
		return methodKeys.filter((key) => isMethodIncluded(key));
	});

	const nextStep = $derived(getHomeNextStep(setupUsed, appUsed));

	const preview = $derived(
		getHomePreview({
			decision: decision.current,
			criteria: criteria.current,
			alternatives: alternatives.current,
			allocation: Array.isArray(allocation.current) ? allocation.current : [],
			rankOrder: Array.isArray(rankOrder.current) ? rankOrder.current : [],
			setupUsed,
			appUsed,
			includedMethods,
		}),
	);

	const setupCards = $derived.by(() => {
		return homeSetupItems.map((item) => {
			return { ...item, icon: setupIcons[item.key], used: setupUsed[item.key] };
		});
	});

	const setupCta = $derived.by(() => {
		const item = homeSetupItems.find((entry) => !setupUsed[entry.key]);
		if (item != null) {
			return {
				href: item.href,
				label:
					item.key === "start"
						? "Start setup"
						: `Continue with ${item.label.toLowerCase()}`,
			};
		}
		return { href: "/weigh", label: "Start evaluating" };
	});

	const toolDoneCount = $derived.by(() => {
		return apps.reduce((count, app) => count + (appUsed[app.key] ? 1 : 0), 0);
	});

	const leaderMeta = $derived.by(() => {
		const parts = [];
		if (preview.leaderSource != null) {
			parts.push(preview.leaderSource);
		}
		if (preview.agreementLabel != null) {
			parts.push(`${preview.agreementLabel} agreement`);
		}
		return parts.join(" · ");
	});
</script>

<main
	id="main-content"
	tabindex="-1"
	class="mx-auto w-full max-w-7xl px-4 pt-4 pb-10"
>
	<div class="space-y-6">
		<Head
			desc={`${info.tagline}. Resume the next step, work through the tools, and review the decision before you commit.`}
		/>

		<section
			class="rounded-lg border border-border bg-[color-mix(in_oklch,var(--color-sky-300)_14%,transparent)] p-5 shadow-sm md:p-6"
		>
			<div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
				<div>
					<SectionHeader
						as="h1"
						eyebrow={info.name}
						eyebrowClass="mb-3"
						title="Make better decisions before you commit."
						titleClass="max-w-[12ch] text-4xl leading-none font-semibold tracking-tight text-balance sm:text-5xl"
						desc={`${info.name} separates setup from evaluation so you can weigh priorities, work through the tools, and review the tradeoffs before you choose an option.`}
						descClass="mt-4 max-w-xl text-base leading-7"
					/>
					<div class="mt-5 flex flex-wrap gap-3">
						<Button href={nextStep.href} class="group h-11 px-5 text-sm">
							{nextStep.label}
							<ArrowRightIcon
								class="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
							/>
						</Button>
						<Button
							href="#homepage-flow"
							variant="outline"
							class="group h-11 px-5 text-sm"
						>
							See the workflow
							<ArrowRightIcon
								class="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
							/>
						</Button>
					</div>
					<p class="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
						If you need a push, AI setup help can generate starter
						alternatives and criteria from the context you have provided.
					</p>
				</div>

				<div
					class="rounded-lg border border-border/70 bg-background/90 p-4 shadow-[0_18px_44px_color-mix(in_oklch,var(--color-slate-950)_10%,transparent)] backdrop-blur"
				>
					{#if preview.hasMeaningfulProgress}
						<h3 class="text-2xl font-semibold tracking-tight">
							{preview.decisionTitle}
						</h3>
						<p class="mt-1 text-sm leading-6 text-muted-foreground">
							{nextStep.note}
						</p>

						<div class="mt-4 grid gap-3 sm:grid-cols-2">
							<StatCard
								label="Setup"
								eyebrowVariant="compact"
								class="bg-muted/25"
							>
								<div class="flex items-center justify-between gap-2">
									<p class="mb-0 text-sm font-medium">
										{preview.setupProgress.done}/{preview.setupProgress.total}
									</p>
								</div>
								<Progress
									class="mt-2"
									max={100}
									value={preview.setupProgress.percent}
									aria-label={`Setup progress: ${preview.setupProgress.done} of ${preview.setupProgress.total}`}
								/>
							</StatCard>
							<StatCard
								label="Tools"
								eyebrowVariant="compact"
								class="bg-muted/25"
							>
								<div class="flex items-center justify-between gap-2">
									<p class="mb-0 text-sm font-medium">
										{preview.appProgress.done}/{preview.appProgress.total}
									</p>
								</div>
								<Progress
									class="mt-2"
									max={100}
									value={preview.appProgress.percent}
									aria-label={`Tool progress: ${preview.appProgress.done} of ${preview.appProgress.total}`}
								/>
							</StatCard>
						</div>

						<div class="mt-4 grid gap-2 sm:grid-cols-3">
							<StatCard
								label="Criteria"
								eyebrowVariant="compact"
								class="bg-card"
							>
								<p class="mt-1 mb-0 text-2xl leading-none font-semibold">
									{preview.criteriaCount}
								</p>
							</StatCard>
							<StatCard
								label="Alternatives"
								eyebrowVariant="compact"
								class="bg-card"
							>
								<p class="mt-1 mb-0 text-2xl leading-none font-semibold">
									{preview.alternativesCount}
								</p>
							</StatCard>
							<StatCard
								label="Methods"
								eyebrowVariant="compact"
								class="bg-card"
							>
								<p class="mt-1 mb-0 text-2xl leading-none font-semibold">
									{preview.includedMethodsCount}
								</p>
							</StatCard>
						</div>

						{#if preview.leaderName != null}
							<StatCard
								label="Leading option"
								eyebrowVariant="compact"
								class="mt-4 border-sky-400/30 bg-sky-400/10"
							>
								<div class="mt-2 flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class="mb-0 truncate text-lg font-semibold">
											{preview.leaderName}
										</p>
										{#if leaderMeta.length > 0}
											<p class="mt-1 mb-0 text-xs text-muted-foreground">
												{leaderMeta}
											</p>
										{/if}
									</div>
									{#if preview.leaderScore != null}
										<p class="mb-0 shrink-0 text-sm font-semibold">
											{preview.leaderScore.toFixed(2)} / 10
										</p>
									{/if}
								</div>
							</StatCard>
						{/if}
					{:else}
						<h3 class="text-2xl font-semibold tracking-tight">
							Start with a decision, not a blank sheet.
						</h3>
						<p class="mt-1 text-sm leading-6 text-muted-foreground">
							Name the decision, list the alternatives, then decide how you want
							to evaluate them.
						</p>

						<div class="mt-4 grid gap-2">
							{#each homeSetupItems as item, i (item.key)}
								<div class="rounded-lg border bg-muted/25 p-3 shadow-xs">
									<div class="flex items-center gap-3">
										<div
											class="inline-flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-semibold"
										>
											{i + 1}
										</div>
										<div>
											<p class="mb-0 text-sm font-medium">{item.label}</p>
											<p
												class="mt-1 mb-0 text-xs leading-5 text-muted-foreground"
											>
												{item.note}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</section>

		<div class="grid gap-3 md:grid-cols-3">
			{#each stages as item (item.label)}
				<a href={item.href} class="group block no-underline" data-card-link>
					<div
						class="h-full rounded-lg border bg-card p-4 shadow-xs transition-colors duration-200 group-hover:bg-accent/35"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<p
									class="mb-2 text-[11px] tracking-[0.24em] text-muted-foreground uppercase"
								>
									{item.number}
								</p>
								<p class="mb-0 text-lg font-semibold">{item.label}</p>
							</div>
							<div
								class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background"
							>
								<item.icon class="size-4" />
							</div>
						</div>
						<p class="mt-3 mb-0 text-sm leading-6 text-muted-foreground">
							{item.note}
						</p>
						<div
							class="mt-4 inline-flex items-center gap-1 text-sm font-medium"
						>
							Go to {item.label.toLowerCase()}
							<ArrowRightIcon
								class="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
							/>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<section id="homepage-flow" class="p-5 md:p-6">
			<div class="flex flex-wrap items-end justify-between gap-3">
				<SectionHeader
					eyebrow="Guide"
					title="Move from setup through evaluation"
					titleClass="text-2xl tracking-tight"
					desc="Keep the overall flow simple: define the choice, work through the tools, then compare outputs before deciding."
					descClass="max-w-2xl text-sm leading-6"
				/>
				<div
					class="rounded-full border bg-muted/25 px-3 py-1.5 text-xs text-muted-foreground"
				>
					{preview.setupProgress.done + preview.appProgress.done} tracked steps completed
				</div>
			</div>

			<div class="mt-5 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
				<article
					id="journey-setup"
					class="rounded-lg border bg-card/85 p-4 shadow-xs"
				>
					<div class="flex items-start justify-between gap-3">
						<SectionHeader
							eyebrow="Setup"
							title="Build the decision before you score it"
							titleClass="text-xl font-semibold tracking-tight"
						/>
						<div
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background"
						>
							<FlagIcon class="size-4" />
						</div>
					</div>
					<p class="mt-3 mb-0 text-sm leading-6 text-muted-foreground">
						A strong decision starts with clean inputs: a clear goal, a real
						list of alternatives, and criteria that reflect what matters.
					</p>

					<div class="mt-4 space-y-2">
						{#each setupCards as item (item.key)}
							<a
								href={item.href}
								class="group block no-underline"
								data-card-link
							>
								<div
									class="rounded-lg border bg-muted/25 p-3 transition-all duration-200 group-hover:bg-accent/35"
								>
									<div class="flex items-start justify-between gap-3">
										<div class="flex min-w-0 items-start gap-3">
											<div
												class="inline-flex size-8 shrink-0 items-center justify-center rounded-md border bg-background"
											>
												<item.icon class="size-4" />
											</div>
											<div class="min-w-0">
												<p class="mb-0 font-medium">{item.label}</p>
												<p
													class="mt-1 mb-0 text-xs leading-5 text-muted-foreground"
												>
													{item.note}
												</p>
											</div>
										</div>
										<span
											class={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
												item.used
													? "border-primary/30 bg-primary/10 text-foreground"
													: "bg-background text-muted-foreground"
											}`}
										>
											{item.used ? "Done" : "Open"}
										</span>
									</div>
								</div>
							</a>
						{/each}
					</div>

					<div class="mt-4">
						<Button href={setupCta.href} variant="outline" size="sm">
							{setupCta.label}
							<ArrowRightIcon class="size-4" />
						</Button>
					</div>
				</article>

				<article
					id="journey-evaluate"
					class="rounded-lg border bg-card/85 p-4 shadow-xs"
				>
					<div class="flex items-start justify-between gap-3">
						<SectionHeader
							eyebrow="Evaluate"
							title="Use the tools to work through tradeoffs"
							titleClass="text-xl font-semibold tracking-tight"
						/>
						<div
							class="rounded-full border bg-muted/25 px-3 py-1.5 text-xs text-muted-foreground"
						>
							{toolDoneCount}/{apps.length} done
						</div>
					</div>
					<p class="mt-3 mb-0 text-sm leading-6 text-muted-foreground">
						Each tool gives you a different angle on the decision. Compare the
						outputs once you have enough signal.
					</p>

					<div class="mt-4 grid gap-3 sm:grid-cols-2">
						{#each apps as app (app.key)}
							<a
								href={app.path}
								class="group block no-underline"
								data-card-link
							>
								<div
									class="h-full rounded-lg border bg-muted/25 p-3 transition-colors duration-200 group-hover:bg-accent/35"
								>
									<div class="flex items-start justify-between gap-2">
										<div
											class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background"
										>
											<app.icon class="size-4" />
										</div>
										<div class="flex flex-wrap justify-end gap-1">
											<span
												class="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
											>
												{app.badge}
											</span>
											<span
												class={`rounded-full border px-2 py-0.5 text-[11px] ${
													appUsed[app.key]
														? "border-primary/30 bg-primary/10 text-foreground"
														: "bg-background text-muted-foreground"
												}`}
											>
												{appUsed[app.key] ? "Done" : "Open"}
											</span>
										</div>
									</div>
									<p class="mt-3 mb-0 text-base font-semibold">{app.title}</p>
									<p class="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
										{app.desc}
									</p>
								</div>
							</a>
						{/each}
					</div>
				</article>
			</div>
		</section>

		<section
			id="journey-decide"
			class="rounded-lg border border-primary/30 bg-[color-mix(in_oklch,var(--color-primary)_12%,transparent)] p-5 md:p-6"
		>
			<div class="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
				<div>
					<SectionHeader
						eyebrow="Decide"
						title="Bring the outputs together before you choose."
						titleClass="text-2xl tracking-tight"
						desc="Summary helps you compare the models side by side. Robustness checks whether the recommendation still holds if your weights move around."
						descClass="text-sm leading-6"
					/>

					<div class="mt-4 grid gap-2 sm:grid-cols-3">
						<StatCard
							label="Criteria"
							eyebrowVariant="compact"
							class="bg-background/85"
						>
							<p class="mt-1 mb-0 text-2xl leading-none font-semibold">
								{preview.criteriaCount}
							</p>
						</StatCard>
						<StatCard
							label="Alternatives"
							eyebrowVariant="compact"
							class="bg-background/85"
						>
							<p class="mt-1 mb-0 text-2xl leading-none font-semibold">
								{preview.alternativesCount}
							</p>
						</StatCard>
						<StatCard
							label="Methods"
							eyebrowVariant="compact"
							class="bg-background/85"
						>
							<p class="mt-1 mb-0 text-2xl leading-none font-semibold">
								{preview.includedMethodsCount}
							</p>
						</StatCard>
					</div>

					{#if preview.leaderName != null}
						<StatCard
							label="Leading option"
							eyebrowVariant="compact"
							class="mt-4 bg-background/85"
						>
							<p class="mt-2 mb-0 text-lg font-semibold">
								{preview.leaderName}
							</p>
							<p class="mt-1 mb-0 text-xs text-muted-foreground">
								{preview.leaderScore?.toFixed(2)} / 10
								{#if leaderMeta.length > 0}
									· {leaderMeta}
								{/if}
							</p>
						</StatCard>
					{/if}
				</div>

				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
					<a href="/analysis" class="group block no-underline" data-card-link>
						<div
							class="h-full rounded-lg border bg-background/90 p-4 shadow-xs transition-colors duration-200 group-hover:bg-accent/35"
						>
							<div class="flex items-start justify-between gap-3">
								<SectionHeader
									eyebrow="Summary"
									title="Compare results side by side"
									titleClass="text-xl font-semibold tracking-tight"
								/>
								<div
									class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-card"
								>
									<BarChart3Icon class="size-4" />
								</div>
							</div>
							<p class="mt-3 mb-0 text-sm leading-6 text-muted-foreground">
								Review the current recommendation, runner-up gap, and
								cross-method agreement in one place.
							</p>
							<div
								class="mt-4 inline-flex items-center gap-1 text-sm font-medium"
							>
								Open Summary
								<ArrowRightIcon
									class="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
								/>
							</div>
						</div>
					</a>

					<a
						href="/analysis/robustness"
						class="group block no-underline"
						data-card-link
					>
						<div
							class="h-full rounded-lg border bg-background/90 p-4 shadow-xs transition-colors duration-200 group-hover:bg-accent/35"
						>
							<div class="flex items-start justify-between gap-3">
								<SectionHeader
									eyebrow="Robustness"
									title="Test whether the result holds up"
									titleClass="text-xl font-semibold tracking-tight"
								/>
								<div
									class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-card"
								>
									<ShieldCheckIcon class="size-4" />
								</div>
							</div>
							<p class="mt-3 mb-0 text-sm leading-6 text-muted-foreground">
								Check whether small weight shifts change the winner before you
								treat the recommendation as settled.
							</p>
							<div
								class="mt-4 inline-flex items-center gap-1 text-sm font-medium"
							>
								Open Robustness
								<ArrowRightIcon
									class="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
								/>
							</div>
						</div>
					</a>
				</div>
			</div>
		</section>
	</div>
</main>

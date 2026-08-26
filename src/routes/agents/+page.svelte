<script lang="ts">
	import Head from "$lib/components/head.svelte";
	import { Button } from "$lib/components/ui/button";
	import { info } from "$lib/info";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import BotIcon from "@lucide/svelte/icons/bot";
	import ListChecksIcon from "@lucide/svelte/icons/list-checks";
	import MapPinIcon from "@lucide/svelte/icons/map-pin";
	import SearchIcon from "@lucide/svelte/icons/search";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";

	const examples = [
		{
			icon: ListChecksIcon,
			text: "Fill out this page based on the decision I described.",
		},
		{
			icon: MapPinIcon,
			text: "I’m deciding whether to move to Providence, Tucson, or Madison. Set up useful criteria and equal weights.",
		},
		{
			icon: SearchIcon,
			text: "Research the missing scores, add sources, and tell me where you had to make assumptions.",
		},
		{
			icon: ShieldCheckIcon,
			text: "Review my summary and tell me which result is most stable.",
		},
	] as const;
</script>

<Head
	title="Use Plought with your AI"
	desc="Let a compatible AI agent help set up, evaluate, and review a decision in Plought."
/>

<main
	id="main-content"
	tabindex="-1"
	class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-14"
>
	<div class="space-y-10">
		<header class="max-w-3xl space-y-5">
			<div
				class="inline-flex size-11 items-center justify-center rounded-xl border bg-card shadow-xs"
			>
				<BotIcon class="size-5" />
			</div>
			<div class="space-y-3">
				<p
					class="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase"
				>
					{info.name} + your AI
				</p>
				<h1
					class="text-4xl leading-none font-semibold tracking-tight text-balance sm:text-5xl"
				>
					Ask your agent for a hand.
				</h1>
			</div>
			<p class="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
				Ask your agent to help with a decision, fill out a page, research an
				option, or review the results. Plought uses
				<a
					href="https://developer.chrome.com/docs/ai/webmcp"
					target="_blank"
					rel="noreferrer"
				>
					WebMCP
				</a>
				to let compatible agents read and update the decision open in your browser.
			</p>
		</header>

		<section class="space-y-4" aria-labelledby="examples-heading">
			<div class="space-y-1">
				<h2 id="examples-heading" class="text-2xl font-semibold tracking-tight">
					Things you can ask
				</h2>
				<p class="text-sm leading-6 text-muted-foreground">
					Use your own words. Your agent can work with the page you already have
					open.
				</p>
			</div>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each examples as example (example.text)}
					<article class="rounded-xl border bg-card p-5 shadow-xs">
						<div
							class="mb-4 inline-flex size-9 items-center justify-center rounded-lg border bg-muted/35"
						>
							<example.icon class="size-4" />
						</div>
						<p class="mb-0 text-sm leading-6">“{example.text}”</p>
					</article>
				{/each}
			</div>
		</section>

		<section class="rounded-xl border bg-muted/25 p-5 shadow-xs sm:p-6">
			<div
				class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="space-y-1">
					<h2 class="text-lg font-semibold tracking-tight">
						Start with a decision
					</h2>
					<p class="mb-0 text-sm leading-6 text-muted-foreground">
						Open it in Plought, then ask your agent to help from any page.
					</p>
				</div>
				<Button href="/setup" class="group shrink-0">
					Start a decision
					<ArrowRightIcon
						class="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
					/>
				</Button>
			</div>
		</section>

		<footer>
			<a href="/" class="inline-flex items-center gap-2 text-sm">
				<ArrowLeftIcon class="size-4" />
				Back to home
			</a>
		</footer>
	</div>
</main>

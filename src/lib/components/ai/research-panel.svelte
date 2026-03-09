<script lang="ts">
	import type {
		AllocateResearchRequest,
		AllocateResearchResult,
		ResearchSource,
		ScoreResearchRequest,
		ScoreResearchResult,
	} from "$lib/ai/types";
	import { Button } from "$lib/components/ui/button";
	import Eyebrow from "$lib/components/ui/eyebrow.svelte";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import CheckIcon from "@lucide/svelte/icons/check";
	import XIcon from "@lucide/svelte/icons/x";
	import { tick } from "svelte";

	type Mode = "score" | "allocate";
	type Result = ScoreResearchResult | AllocateResearchResult;
	type LoadRequest = ScoreResearchRequest | AllocateResearchRequest;
	type Card = { pending: boolean; value: Result | null };
	type Props = {
		canGenerate: boolean;
		load: (input: LoadRequest) => PromiseLike<Result>;
		message?: string;
		mode: Mode;
		onClose?: () => void;
		onApply: (result: Result) => void;
		request: LoadRequest | null;
		target: string;
	};

	let {
		canGenerate,
		load,
		message = "",
		mode,
		onClose,
		onApply,
		request,
		target,
	}: Props = $props();

	let applied = $state(false);
	let output = $state<HTMLDivElement | null>(null);

	const isScore = (value: Result | null): value is ScoreResearchResult => {
		return value != null && "suggestedScore" in value;
	};

	const formatValue = (value: number) => {
		if (!Number.isFinite(value)) {
			return "0";
		}
		return value.toFixed(2).replace(/\.?0+$/, "");
	};

	const getConsiderations = (value: Result | null) => {
		return isScore(value) ? value.considerations : [];
	};

	const getSources = (value: Result | null): ResearchSource[] => {
		return value?.sources ?? [];
	};

	const apply = (value: Result | null) => {
		if (applied || value == null) {
			return;
		}
		onApply(value);
		applied = true;
	};

	const getErrorMessage = (value: unknown) => {
		return value instanceof Error
			? value.message
			: "Research could not be generated right now.";
	};

	$effect(() => {
		const requestId = request?.requestId;
		if (requestId == null) {
			return;
		}

		applied = false;
		tick().then(() => {
			output?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	});
</script>

{#snippet scoreCard({ value, pending }: Card)}
	{@const result = isScore(value) ? value : null}
	<section class="rounded-lg border bg-muted/10 p-3 shadow-xs">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="min-w-0 flex-1">
				<Eyebrow>Suggested score</Eyebrow>
				{#if pending || result == null}
					<Skeleton class="mt-2 h-8 w-16" />
				{:else}
					<p class="mt-2 text-2xl font-semibold">
						{formatValue(result.suggestedScore)}
					</p>
				{/if}
			</div>
			{#if pending}
				<div class="flex items-center gap-3">
					<div
						class="size-4 shrink-0 rounded-full border-2 border-muted border-t-foreground/70 motion-safe:animate-spin"
					></div>
					<Button size="sm" disabled>Apply score</Button>
				</div>
			{:else}
				<Button
					size="sm"
					variant={applied ? "secondary" : "default"}
					disabled={applied}
					onclick={() => apply(result)}
				>
					{#if applied}
						<CheckIcon class="size-3.5" />
						Applied
					{:else}
						Apply score
					{/if}
				</Button>
			{/if}
		</div>
		<div class="mt-3">
			{#if pending || result == null}
				<div class="space-y-2">
					<Skeleton class="h-3 w-full bg-muted/45" />
					<Skeleton class="h-3 w-3/4 bg-muted/45" />
				</div>
			{:else}
				<p
					class="text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:text-foreground"
				>
					{@html result.reason}
				</p>
			{/if}
		</div>
	</section>
{/snippet}

{#snippet considerationsCard({ value, pending }: Card)}
	{@const items = getConsiderations(value)}
	<section class="min-w-72 flex-1 rounded-lg border bg-muted/10 p-3 shadow-xs">
		<Eyebrow class="mb-2">Considerations</Eyebrow>
		{#if pending}
			<div class="mt-3 space-y-2">
				<Skeleton class="h-3 w-full bg-muted/45" />
				<Skeleton class="h-3 w-5/6 bg-muted/45" />
				<Skeleton class="h-3 w-2/3 bg-muted/45" />
			</div>
		{:else}
			<ul class="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
				{#each items as item (item)}
					<li
						class="[&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:text-foreground"
					>
						{@html item}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/snippet}

{#snippet sourcesCard({ value, pending }: Card)}
	{@const items = getSources(value)}
	<section class="min-w-72 flex-1 rounded-lg border bg-muted/10 p-3 shadow-xs">
		<Eyebrow class="mb-2">Sources</Eyebrow>
		{#if pending}
			<div class="mt-3 flex flex-wrap gap-2">
				<Skeleton class="h-7 w-20 rounded-md" />
				<Skeleton class="h-7 w-24 rounded-md" />
				<Skeleton class="h-7 w-16 rounded-md" />
				<Skeleton class="h-7 w-20 rounded-md" />
			</div>
		{:else}
			<ul class="flex flex-wrap gap-2">
				{#each items as item (item.url)}
					<li class="flex-none">
						<a
							class="inline-flex rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:text-foreground"
							href={item.url}
							target="_blank"
							rel="noreferrer noopener"
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/snippet}

{#snippet allocateAction({ value, pending }: Card)}
	<div class="flex justify-end">
		{#if pending}
			<div class="flex items-center gap-3">
				<div
					class="size-4 shrink-0 rounded-full border-2 border-muted border-t-foreground/70 motion-safe:animate-spin"
				></div>
				<Button size="sm" disabled>Apply allocation</Button>
			</div>
		{:else}
			<Button
				size="sm"
				variant={applied ? "secondary" : "default"}
				disabled={applied}
				onclick={() => apply(value)}
			>
				{#if applied}
					<CheckIcon class="size-3.5" />
					Applied
				{:else}
					Apply allocation
				{/if}
			</Button>
		{/if}
	</div>
{/snippet}

{#snippet allocateList({ value, pending }: Card)}
	{@const result = !isScore(value) ? value : null}
	<div class="mt-3 grid gap-2">
		{#if pending || result == null}
			{#each [1, 2, 3, 4] as item (item)}
				<div class="rounded-lg border bg-muted/10 p-3 shadow-xs">
					<div class="flex items-start justify-between gap-3">
						<Skeleton class="h-4 w-32" />
						<Skeleton class="h-11 w-20 rounded-lg" />
					</div>
					<div class="mt-2 space-y-2">
						<Skeleton class="h-3 w-full bg-muted/45" />
						<Skeleton class="h-3 w-4/5 bg-muted/45" />
					</div>
				</div>
			{/each}
		{:else}
			{#each result.suggestedPoints as item (item.alternative)}
				<div class="rounded-lg border bg-muted/10 p-3 shadow-xs">
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="font-medium">{item.alternative}</p>
							<p
								class="text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:text-foreground"
							>
								{@html item.reason}
							</p>
						</div>
						<div
							class="flex shrink-0 flex-col gap-1 rounded-lg border bg-background px-3 pt-3 pb-2 text-center shadow-xs"
						>
							<p class="my-0 text-lg leading-none font-semibold tabular-nums">
								{formatValue(item.points)}
							</p>
							<p class="text-xs font-medium text-muted-foreground uppercase">
								pts
							</p>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
{/snippet}

<section class="mt-3 rounded-lg border bg-muted/10 p-3 shadow-xs">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<Eyebrow class="mb-2">Research</Eyebrow>
			<p class="font-medium">{target}</p>
		</div>
		{#if onClose != null}
			<Button
				size="icon-sm"
				variant="ghost"
				aria-label={`Dismiss ${target}`}
				onclick={onClose}
			>
				<XIcon class="size-3.5" />
			</Button>
		{/if}
	</div>

	<div bind:this={output}>
		{#if !canGenerate && message}
			<p class="mt-3 text-sm text-muted-foreground">{message}</p>
		{/if}
		{#if request != null}
			{#key request.requestId}
				<svelte:boundary>
					{@const result = await load(request)}
					<div aria-live="polite" class="mt-3">
						{#if isScore(result)}
							{@render scoreCard({ value: result, pending: false })}
							{#if getConsiderations(result).length > 0 || getSources(result).length > 0}
								<div class="mt-px flex flex-wrap gap-2">
									{#if getConsiderations(result).length > 0}
										{@render considerationsCard({
											value: result,
											pending: false,
										})}
									{/if}
									{#if getSources(result).length > 0}
										{@render sourcesCard({ value: result, pending: false })}
									{/if}
								</div>
							{/if}
						{:else}
							{@render allocateAction({ value: result, pending: false })}
							{@render allocateList({ value: result, pending: false })}
							{#if getSources(result).length > 0}
								<div class="mt-3">
									{@render sourcesCard({ value: result, pending: false })}
								</div>
							{/if}
						{/if}
					</div>
					{#snippet pending()}
						<div aria-live="polite" role="status" class="mt-3">
							{#if mode === "score"}
								{@render scoreCard({ value: null, pending: true })}
								<div class="mt-px flex flex-wrap gap-2">
									{@render considerationsCard({ value: null, pending: true })}
									{@render sourcesCard({ value: null, pending: true })}
								</div>
							{:else}
								{@render allocateAction({ value: null, pending: true })}
								{@render allocateList({ value: null, pending: true })}
							{/if}
						</div>
					{/snippet}
					{#snippet failed(error, reset)}
						<div
							class="mt-3 rounded-lg border border-destructive/30 bg-background p-3 shadow-xs"
						>
							<p class="text-sm text-muted-foreground">
								{getErrorMessage(error)}
							</p>
							<div class="mt-3 flex justify-end">
								<Button size="sm" variant="outline" onclick={reset}>
									Try again
								</Button>
							</div>
						</div>
					{/snippet}
				</svelte:boundary>
			{/key}
		{/if}
	</div>
</section>
